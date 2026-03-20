import { supabase, requireAuth, requireAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // GET - Fetch user's cart
    if (req.method === 'GET') {
        const user = requireAuth(req, res);
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('cart')
                .select('*, products(*)')
                .eq('user_id', user.id);

            if (error) throw error;
            return res.json(data || []);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch cart' });
        }
    }

    // POST - Add to cart
    if (req.method === 'POST') {
        const user = requireAuth(req, res);
        if (!user) return;

        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: 'Product ID required' });
        }

        try {
            // Check if item already in cart
            const { data: existing } = await supabase
                .from('cart')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product_id)
                .single();

            if (existing) {
                // Update quantity
                const { data, error } = await supabase
                    .from('cart')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return res.json(data);
            } else {
                // Add new item
                const { data, error } = await supabase
                    .from('cart')
                    .insert([{ user_id: user.id, product_id, quantity }])
                    .select()
                    .single();

                if (error) throw error;
                return res.json(data);
            }
        } catch (error) {
            return res.status(500).json({ error: 'Failed to add to cart' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
