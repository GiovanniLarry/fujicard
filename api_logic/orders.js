import { supabase, authenticateUser, getCartKey } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const cartKey = getCartKey(req);
    const user = req.user; // Set by optionalAuth if token present

    // GET - Fetch user's orders
    if (req.method === 'GET') {
        const authUser = req.user; // GET always needs real auth in this version
        if (!authUser) return res.status(401).json({ error: 'Authentication required' });

        try {
            const { id } = req.query;
            let query = supabase.from('orders').select('*, order_items(*)');

            if (id) query = query.eq('id', id);
            query = query.eq('user_id', authUser.id).order('created_at', { ascending: false });

            const { data, error } = await query;
            if (id && error) return res.status(404).json({ error: 'Order not found' });
            if (error) throw error;

            return res.json(id ? data[0] : (data || []));
        } catch (error) {
            console.error('Fetch orders error:', error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }

    // POST - Create new order (Checkout)
    if (req.method === 'POST') {
        try {
            const {
                items,
                shipping_address,
                payment_method = 'card',
                total,
                subtotal: reqSubtotal,
                shipping: reqShipping,
                currency = 'ZAR'
            } = req.body;

            // 1. Get Cart
            const { data: cart } = await supabase
                .from('carts')
                .select('*, cart_items(*, products(*))')
                .eq('session_id', cartKey)
                .single();

            if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }

            // 2. Validate Stock & Calculate Totals
            const validatedItems = [];
            let calculatedSubtotal = 0;

            for (const item of cart.cart_items) {
                const product = item.products;
                if (!product || product.stock < item.quantity) {
                    return res.status(400).json({ error: `Insufficient stock for ${product?.name || 'product'}` });
                }
                validatedItems.push({
                    product_id: product.id,
                    quantity: item.quantity,
                    price: product.price
                });
                calculatedSubtotal += product.price * item.quantity;
            }

            const shippingCost = calculatedSubtotal >= 50 ? 0 : 4.99;
            const finalTotal = total || (calculatedSubtotal + shippingCost);

            // 3. Handle Shipping Address (Insert if table exists)
            let shippingAddressId = null;
            if (shipping_address) {
                try {
                    const { data: addr, error: addrErr } = await supabase
                        .from('shipping_addresses')
                        .insert([{
                            first_name: shipping_address.firstName,
                            last_name: shipping_address.lastName,
                            address: shipping_address.address,
                            city: shipping_address.city,
                            postcode: shipping_address.postcode,
                            country: shipping_address.country,
                            phone: shipping_address.phone,
                            email: shipping_address.email,
                            user_id: user ? user.id : null
                        }])
                        .select()
                        .single();
                    if (!addrErr && addr) shippingAddressId = addr.id;
                } catch (e) {
                    console.log('shipping_addresses table insertion failed, continuing without it.');
                }
            }

            // 4. Create Order Number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // 5. Insert Order
            const { data: newOrder, error: orderErr } = await supabase
                .from('orders')
                .insert([{
                    user_id: user ? user.id : null,
                    session_id: user ? null : cartKey,
                    order_number: orderNumber,
                    status: 'pending',
                    shipping_address_id: shippingAddressId,
                    payment_method,
                    currency,
                    subtotal: calculatedSubtotal.toFixed(2),
                    shipping_cost: shippingCost.toFixed(2),
                    total: finalTotal.toFixed(2),
                    notes: JSON.stringify({ shipping_address, payment_method })
                }])
                .select()
                .single();

            if (orderErr) throw orderErr;

            // 6. Insert Order Items & Update Stock
            for (const item of validatedItems) {
                // Insert item
                await supabase.from('order_items').insert({
                    order_id: newOrder.id,
                    product_id: item.product_id,
                    quantity: item.quantity
                });

                // Reduce stock
                const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
                if (p) {
                    await supabase.from('products').update({ stock: p.stock - item.quantity }).eq('id', item.product_id);
                }
            }

            // 7. Clear Cart (Except for PayFast, though clearing it now is mostly safe)
            await supabase.from('cart_items').delete().eq('cart_id', cart.id);

            return res.json({ order: newOrder, success: true });

        } catch (error) {
            console.error('Checkout error:', error);
            return res.status(500).json({ error: error.message || 'Failed to create order' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
