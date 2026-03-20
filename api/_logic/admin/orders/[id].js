import { supabase, authenticateAdmin } from '../../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Order ID is required' });

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*)), shipping_addresses(*), users(username, email)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'PUT') {
            const { status } = req.body;
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return res.json(data);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[Admin Order Details] Error:', error);
        return res.status(500).json({ error: 'Failed to process order', details: error.message });
    }
}
