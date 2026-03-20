import crypto from 'crypto';
import { supabase, authenticateUser, getCartKey, optionalAuth } from './_utils.js';

// Helper to generate PayFast MD5 signature
const generatePayfastSignature = (data, passPhrase = null) => {
    const sortedKeys = Object.keys(data).sort();
    const parts = sortedKeys.map(key => {
        const value = String(data[key]).trim();
        if (!value) return null;
        return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
    }).filter(Boolean);

    let pfParamString = parts.join('&');
    if (passPhrase) {
        pfParamString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
    }
    return crypto.createHash('md5').update(pfParamString).digest('hex');
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const cartKey = getCartKey(req);
    const user = authenticateUser(req);

    // GET - Fetch user's orders (Rest of the code remains same...)
    if (req.method === 'GET') {
        if (!user) return res.status(401).json({ error: 'Authentication required' });
        try {
            const { id } = req.query;
            let query = supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id);
            if (id) query = query.eq('id', id).single();
            else query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }

    // POST /checkout and /payfast/generate
    if (req.method === 'POST') {
        const subpath = req.query.subpath || '';

        // --- PAYFAST GENERATE ---
        if (subpath === 'payfast/generate') {
            try {
                const { orderId } = req.body;
                const { data: order, error } = await supabase
                    .from('orders')
                    .select('*, shipping_addresses(*)')
                    .eq('id', orderId)
                    .single();

                if (error || !order) return res.status(404).json({ error: 'Order not found' });

                const shipping = order.shipping_addresses || {};
                const email = (shipping.email || user?.email || 'customer@fujicard.com').trim();
                const firstName = (shipping.first_name || user?.firstName || 'Customer').trim();
                const lastName = (shipping.last_name || user?.lastName || 'User').trim();

                const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'Desormais190';
                const host = req.headers.host || 'fujicard-m571.vercel.app';
                const protocol = req.headers['x-forwarded-proto'] || 'https';
                const baseUrl = `${protocol}://${host}`;

                const payload = {
                    merchant_id: process.env.PAYFAST_MERCHANT_ID || '22427478',
                    merchant_key: process.env.PAYFAST_MERCHANT_KEY || 'kt2fwjkagmjli',
                    return_url: `${baseUrl}/order-confirmation/${order.id}`,
                    cancel_url: `${baseUrl}/cart?order_id=${order.id}&cancel=true`,
                    notify_url: `${baseUrl}/api/orders/payfast/notify`,
                    name_first: firstName,
                    name_last: lastName,
                    email_address: email,
                    m_payment_id: String(order.id),
                    amount: parseFloat(order.total).toFixed(2),
                    item_name: `Order ${order.order_number}`
                };

                payload.signature = generatePayfastSignature(payload, PASSPHRASE);
                return res.json({ url: process.env.PAYFAST_URL || 'https://www.payfast.co.za/eng/process', payload });
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        }

        // --- CHECKOUT ---
        try {
            const {
                items,
                shipping_address,
                payment_method = 'card',
                total,
                currency = 'ZAR'
            } = req.body;

            // 1. Get Cart
            const { data: cart } = await supabase.from('carts').select('*, cart_items(*, products(*))').eq('session_id', cartKey).single();
            if (!cart || !cart.cart_items || cart.cart_items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

            // 2. Validate Stock & Calculate Totals
            const validatedItems = [];
            let calculatedSubtotal = 0;
            for (const item of cart.cart_items) {
                const product = item.products;
                if (!product || product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product?.name || 'product'}` });
                validatedItems.push({ product_id: product.id, quantity: item.quantity, price: product.price });
                calculatedSubtotal += product.price * item.quantity;
            }

            const shippingCost = calculatedSubtotal >= 50 ? 0 : 4.99;
            const finalTotal = total || (calculatedSubtotal + shippingCost);

            // 3. Shipping Address
            let shippingAddressId = null;
            if (shipping_address) {
                const { data: addr } = await supabase.from('shipping_addresses').insert([{
                    first_name: shipping_address.firstName, last_name: shipping_address.lastName,
                    address: shipping_address.address, city: shipping_address.city,
                    postcode: shipping_address.postcode, country: shipping_address.country,
                    phone: shipping_address.phone, email: shipping_address.email,
                    user_id: user ? user.id : null
                }]).select().single();
                if (addr) shippingAddressId = addr.id;
            }

            // 4. Create Order
            const { data: newOrder, error: orderErr } = await supabase.from('orders').insert([{
                user_id: user ? user.id : null, session_id: user ? null : cartKey,
                order_number: `ORD-${Date.now()}`, status: 'pending',
                shipping_address_id: shippingAddressId, payment_method,
                currency, subtotal: calculatedSubtotal.toFixed(2),
                shipping_cost: shippingCost.toFixed(2), total: finalTotal.toFixed(2),
                notes: JSON.stringify({ shipping_address, payment_method })
            }]).select().single();

            if (orderErr) throw orderErr;

            // 5. Order Items & Stock
            for (const item of validatedItems) {
                await supabase.from('order_items').insert({ order_id: newOrder.id, product_id: item.product_id, quantity: item.quantity });
                const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
                if (p) await supabase.from('products').update({ stock: p.stock - item.quantity }).eq('id', item.product_id);
            }

            // 6. Clear Cart
            await supabase.from('cart_items').delete().eq('cart_id', cart.id);

            return res.json({ order: newOrder, success: true });
        } catch (error) {
            return res.status(500).json({ error: error.message || 'Failed to create order' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
