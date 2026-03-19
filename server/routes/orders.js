import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * Generate PayFast MD5 signature.
 * CRITICAL: Values must stay RAW (not URL-encoded) inside the hash string.
 * This matches the PayFast PHP SDK exactly:
 *   foreach ($data as $key => $val) { $pfParamString .= $key .'='. urlencode(trim($val)) .'&'; }
 * urlencode in PHP converts spaces to + and encodes special chars.
 * We replicate that with encodeURIComponent(...).replace(/%20/g, '+').
 */
const generatePayfastSignature = (data, passPhrase = null) => {
  // Step 1: Remove empty/null/undefined values
  const filtered = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      filtered[key] = String(val).trim();
    }
  }

  // Step 2: Sort keys alphabetically
  const sortedKeys = Object.keys(filtered).sort();

  // Step 3: Build query string the same way PHP urlencode() does
  // PHP urlencode: spaces become +, special chars become %XX
  const parts = sortedKeys.map(key => {
    const encoded = encodeURIComponent(filtered[key]).replace(/%20/g, '+');
    return `${key}=${encoded}`;
  });

  let pfParamString = parts.join('&');

  // Step 4: Append passphrase if set (sandbox accounts typically have no passphrase)
  if (passPhrase && passPhrase.trim() !== '') {
    const encodedPassPhrase = encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+');
    pfParamString += `&passphrase=${encodedPassPhrase}`;
  }

  console.log('[PayFast] Signature string:', pfParamString);

  // Step 5: MD5 hash
  return crypto.createHash('md5').update(pfParamString).digest('hex');
};

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        status,
        subtotal,
        shipping_cost,
        tax,
        total,
        currency,
        shipping_address_id,
        payment_method,
        notes,
        created_at,
        updated_at,
        session_id,
        order_items (
          id,
          product_id,
          quantity
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format orders to match frontend expectations
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.order_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: 0, // Default price since column doesn't exist
        name: 'Product', // Default name since column doesn't exist
        image: '' // Default image since column doesn't exist
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        status,
        subtotal,
        shipping_cost,
        tax,
        total,
        currency,
        shipping_address_id,
        payment_method,
        notes,
        created_at,
        updated_at,
        session_id,
        order_items (
          id,
          product_id,
          quantity
        )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format order
    const formattedOrder = {
      ...order,
      items: order.order_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: 0, // Default price since column doesn't exist
        name: 'Product', // Default name since column doesn't exist
        image: '' // Default image since column doesn't exist
      }))
    };

    res.json({ order: formattedOrder });
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create order (checkout)
router.post('/checkout', optionalAuth, async (req, res) => {
  try {
    const shippingAddress = req.body.shippingAddress || req.body.shipping_address;
    const paymentMethod = req.body.paymentMethod || req.body.payment_method;
    const { billingAddress, currency = 'GBP', total } = req.body;
    const cartKey = req.user ? req.user.id : req.headers['x-session-id'] || 'guest';

    // Get cart
    const { data: cart } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items (
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock
          )
        )
      `)
      .eq('session_id', cartKey)
      .single();

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address required' });
    }

    // Check stock availability and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.cart_items) {
      const product = cartItem.products;

      if (!product || product.stock < cartItem.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product?.name || 'product'}` });
      }

      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image_url: product.image_url
      });

      subtotal += product.price * cartItem.quantity;
    }

    const shipping = subtotal >= 50 ? 0 : 4.99;
    const orderTotal = total || subtotal + shipping;

    // Check minimum order amount ($500)
    if (subtotal < 500) {
      return res.status(400).json({
        error: `Minimum order value is $500. Your current total is $${subtotal.toFixed(2)}. Please add more items to checkout.`
      });
    }

    // Create shipping address record first
    let shippingAddressId = null;
    try {
      const { data: newShippingAddress, error: shippingError } = await supabase
        .from('shipping_addresses')
        .insert({
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          user_id: req.user ? req.user.id : null
        })
        .select()
        .single();

      if (shippingError) {
        console.log('Shipping address insert error, trying fallback:', shippingError.message);
        // If shipping_addresses table doesn't exist, continue without it
      } else {
        shippingAddressId = newShippingAddress.id;
      }
    } catch (shippingError) {
      console.log('Shipping address table might not exist, continuing...');
    }

    // Reduce stock for each product
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }
    }

    // Create order
    const orderData = {
      user_id: req.user ? req.user.id : null,
      session_id: req.user ? null : cartKey,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      status: 'pending',
      shipping_address_id: shippingAddressId,
      payment_method: paymentMethod || 'card',
      currency: currency,
      subtotal: subtotal.toFixed(2),
      shipping_cost: shipping.toFixed(2),
      total: orderTotal.toFixed(2),
      notes: JSON.stringify({
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod
      })
    };

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    for (const item of orderItems) {
      await supabase
        .from('order_items')
        .insert({
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity
        });
    }

    // Clear cart only if NOT using PayFast (PayFast leaves cart intact until webhook succeeds)
    if (paymentMethod !== 'payfast') {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    res.json({
      order: {
        ...newOrder,
        shippingAddress: shippingAddress, // Include shipping address in response
        items: orderItems.map(item => ({
          ...item,
          id: item.product_id,
          productId: item.product_id,
          image: item.image_url
        }))
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate PayFast payload
router.post('/payfast/generate', optionalAuth, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Fetch order error for PayFast:', error);
      return res.status(404).json({ error: 'Order not found' });
    }

    let shippingDetails = {};
    try {
      if (order.notes) {
        const parsedNotes = JSON.parse(order.notes);
        shippingDetails = parsedNotes.shippingAddress || {};
      }
    } catch (e) {
      console.error('Could not parse order notes:', e);
    }

    let host = req.get('host');
    let protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    let baseUrl = `${protocol}://${host}`;

    // Many times, frontend origin is needed to redirect back. Let's rely on the referer or hardcode typical dev port
    let originUrl = req.get('origin') || 'http://localhost:5173';

    // We only spoof the notify_url so the sandbox hash verification doesn't restrict the ping.
    // The user's browser URLs MUST remain original (localhost) to prevent cross-domain logout!
    let spoofedBaseUrl = baseUrl;
    const isLocal = originUrl.includes('localhost') || originUrl.includes('127.0.0.1');

    if (isLocal) {
      spoofedBaseUrl = 'https://fujicardshop.app';
    }

    // LIVE credentials - real payments will be processed
    // To switch back to sandbox: use ID 10000100 / key 46f0cd694581a and sandbox URL
    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '22427478';
    const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || 'kt2fwjkagmjli';
    const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'Desormais190';
    const PAYFAST_URL = process.env.PAYFAST_URL || 'https://www.payfast.co.za/eng/process';

    // Build payload WITHOUT signature first (so signature excludes itself)
    const payloadData = {};

    // --- Merchant fields ---
    payloadData.merchant_id = MERCHANT_ID;
    payloadData.merchant_key = MERCHANT_KEY;

    // --- Return URLs (only add if we have a real public domain to avoid WAF 403 on localhost) ---
    if (!isLocal) {
      payloadData.return_url = `${originUrl}/order-confirmation/${order.id}`;
      payloadData.cancel_url = `${originUrl}/cart`;
    }

    // --- Notify URL: always use server-accessible URL ---
    payloadData.notify_url = `${spoofedBaseUrl}/api/orders/payfast/notify`;

    // --- Buyer info ---
    payloadData.name_first = shippingDetails.firstName || 'Customer';
    payloadData.name_last = shippingDetails.lastName || 'User';
    payloadData.email_address = shippingDetails.email || 'customer@fujicard.com';

    // --- Transaction info ---
    payloadData.m_payment_id = String(order.id);
    payloadData.amount = parseFloat(order.total).toFixed(2);
    payloadData.item_name = `Order ${order.order_number}`;

    // --- Generate signature AFTER all fields are set ---
    const signature = generatePayfastSignature(payloadData, PASSPHRASE || null);
    payloadData.signature = signature;

    console.log('[PayFast] Final payload:', payloadData);

    res.json({
      url: PAYFAST_URL,
      payload: payloadData
    });

  } catch (error) {
    console.error('PayFast generate error:', error);
    res.status(500).json({ error: 'Failed to generate payment payload' });
  }
});

// PayFast ITN Webhook endpoint
router.post('/payfast/notify', async (req, res) => {
  try {
    const pfData = req.body;

    // Extract signature
    const receivedSignature = pfData.signature;
    delete pfData.signature;

    // Verify signature
    const calculatedSignature = generatePayfastSignature(pfData, process.env.PAYFAST_PASSPHRASE);

    if (calculatedSignature !== receivedSignature) {
      console.error('PayFast ITN signature mismatch');
      return res.status(400).send('Signature mismatch');
    }

    // 4. Extract critical fields
    const orderId = pfData.m_payment_id;
    const paymentStatus = pfData.payment_status;
    const amountGross = parseFloat(pfData.amount_gross);

    // 5. Fetch the original order from the database to confirm the amount
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found for ITN');
      return res.status(404).send('Order not found');
    }

    // 6. Verify that the payment is COMPLETE and the amount matches
    // We check absolute difference to avoid floating point precision issues
    const isAmountCorrect = Math.abs(amountGross - parseFloat(order.total)) < 0.01;

    if (paymentStatus === 'COMPLETE') {
      if (!isAmountCorrect) {
        console.error(`PayFast ITN Amount mismatch! Expected ${order.total}, got ${amountGross}`);
        // We do not fulfill the order if they underpaid
        return res.status(400).send('Amount mismatch');
      }

      // 7. Success! Update the database to reflect the completed payment
      const { error } = await supabase
        .from('orders')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update order status on PayFast ITN:', error);
      } else {
        console.log(`Order ${orderId} successfully paid via PayFast ITN`);
      }
    } else {
      console.log(`Order ${orderId} payment status: ${paymentStatus}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast ITN handler error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Restore cart and stock on payment failure/cancellation
router.post('/:id/restore-cart', optionalAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { data: order, error: orderErr } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single();

    if (orderErr || !order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'cancelled') return res.json({ success: true, message: 'Already cancelled' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be restored' });

    // 1. Mark order as cancelled
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);

    // 2. Restore stock
    if (order.order_items && order.order_items.length > 0) {
      for (const item of order.order_items) {
        const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
        if (product) {
          await supabase.from('products').update({ stock: product.stock + item.quantity }).eq('id', item.product_id);
        }
      }
    }

    // 3. Rebuild the cart
    const cartKey = order.session_id || 'guest';
    let { data: cart } = await supabase.from('carts').select('*').or(`user_id.eq.${order.user_id},session_id.eq.${cartKey}`);
    let targetCart = cart && cart.length > 0 ? cart[0] : null;

    if (!targetCart) {
      const { data: newCart } = await supabase.from('carts').insert({ user_id: order.user_id || null, session_id: cartKey }).select().single();
      targetCart = newCart;
    }

    if (targetCart && order.order_items) {
      for (const item of order.order_items) {
        const { data: existing } = await supabase.from('cart_items').select('*').eq('cart_id', targetCart.id).eq('product_id', item.product_id).single();
        if (existing) {
          await supabase.from('cart_items').update({ quantity: existing.quantity + item.quantity }).eq('id', existing.id);
        } else {
          await supabase.from('cart_items').insert({ cart_id: targetCart.id, product_id: item.product_id, quantity: item.quantity });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Restore cart error:', error);
    res.status(500).json({ error: 'Failed to restore cart' });
  }
});

export default router;
