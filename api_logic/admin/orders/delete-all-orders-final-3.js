import { supabase, authenticateAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // DELETE all orders
    if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) throw error;
            return res.json({ message: 'All orders deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete all orders' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
