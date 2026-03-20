import { supabase, requireAuth } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // GET - Fetch user's orders
    if (req.method === 'GET') {
        const user = requireAuth(req, res);
        if (!user) return;

        try {
            const { id } = req.query;

            if (id) {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .single();
                if (error) throw error;
                return res.json(data);
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.json(data || []);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }

    // POST - Create new order
    if (req.method === 'POST') {
        const user = requireAuth(req, res);
        if (!user) return;

        const { items, total, currency = 'USD', payment_method = 'crypto' } = req.body;

        if (!items || !total) {
            return res.status(400).json({ error: 'Items and total required' });
        }

        try {
            // Generate order number
            const orderNumber = 'FC-' + Date.now().toString(36).toUpperCase();

            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    order_number: orderNumber,
                    items: JSON.stringify(items),
                    total,
                    currency,
                    payment_method,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;

            // Clear cart after order
            await supabase
                .from('cart')
                .delete()
                .eq('user_id', user.id);

            return res.json(data);
        } catch (error) {
            console.error('Order creation error:', error);
            return res.status(500).json({ error: 'Failed to create order' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
