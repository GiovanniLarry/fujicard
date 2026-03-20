import { supabase, authenticateUser, getCartKey } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const cartKey = getCartKey(req);
        const subpath = req.query.subpath || '';

        // Helper to get or create cart
        const getOrCreateCart = async () => {
            let { data: cart } = await supabase
                .from('carts')
                .select('*')
                .eq('session_id', cartKey)
                .single();

            if (!cart) {
                const { data: newCart, error: insertError } = await supabase
                    .from('carts')
                    .insert({
                        session_id: cartKey,
                        user_id: authenticateUser(req)?.id || null
                    })
                    .select()
                    .single();

                if (insertError) {
                    // Handle race condition on duplicate key
                    if (insertError.code === '23505') {
                        const { data: recovered } = await supabase.from('carts').select('*').eq('session_id', cartKey).single();
                        return recovered;
                    }
                    throw insertError;
                }
                return newCart;
            }
            return cart;
        };

        // ROUTING

        // GET / - Fetch cart
        if (req.method === 'GET' && !subpath) {
            const cart = await getOrCreateCart();
            const { data: items, error } = await supabase
                .from('cart_items')
                .select('*, products(*)')
                .eq('cart_id', cart.id);

            if (error) throw error;

            const populatedItems = (items || []).map(item => ({
                id: item.id,
                productId: item.product_id,
                quantity: item.quantity,
                product: item.products
            }));

            const subtotal = populatedItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

            return res.json({
                items: populatedItems,
                itemCount: populatedItems.reduce((sum, item) => sum + item.quantity, 0),
                subtotal: subtotal.toFixed(2)
            });
        }

        // POST /add - Add to cart
        if (req.method === 'POST' && subpath === 'add') {
            const { productId, quantity = 1 } = req.body;
            if (!productId) return res.status(400).json({ error: 'Product ID required' });

            const [productRes, cart] = await Promise.all([
                supabase.from('products').select('*').eq('id', productId).single(),
                getOrCreateCart()
            ]);

            if (productRes.error || !productRes.data) return res.status(404).json({ error: 'Product not found' });
            if (productRes.data.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('cart_id', cart.id)
                .eq('product_id', productId)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('cart_items')
                    .insert({ cart_id: cart.id, product_id: productId, quantity });
                if (error) throw error;
            }

            return res.json({ success: true, message: 'Added to cart' });
        }

        // PUT /update/:id
        if (req.method === 'PUT' && subpath.startsWith('update/')) {
            const itemId = subpath.replace('update/', '');
            const { quantity } = req.body;

            if (quantity <= 0) {
                await supabase.from('cart_items').delete().eq('id', itemId);
            } else {
                await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
            }
            return res.json({ success: true });
        }

        // DELETE /remove/:id
        if (req.method === 'DELETE' && subpath.startsWith('remove/')) {
            const itemId = subpath.replace('remove/', '');
            await supabase.from('cart_items').delete().eq('id', itemId);
            return res.json({ success: true });
        }

        // DELETE /clear
        if (req.method === 'DELETE' && subpath === 'clear') {
            const cart = await getOrCreateCart();
            await supabase.from('cart_items').delete().eq('cart_id', cart.id);
            return res.json({ success: true });
        }

        return res.status(404).json({ error: 'Endpoint not found in cart handler' });

    } catch (error) {
        console.error('Cart operation error:', error);

        // Comprehensive error extraction
        let errorString = 'Unknown Error';
        if (typeof error === 'string') {
            errorString = error;
        } else if (error && error.message) {
            errorString = error.message;
        } else if (error && error.details) {
            errorString = error.details;
        } else {
            try {
                errorString = JSON.stringify(error);
            } catch (e) {
                errorString = String(error);
            }
        }

        // Return a plain string in the error field to guarantee alert compatibility
        return res.status(500).json({ error: errorString });
    }
}
