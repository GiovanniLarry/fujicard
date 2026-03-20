import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, users(username, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data || []);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
