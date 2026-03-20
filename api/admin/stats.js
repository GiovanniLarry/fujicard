import { supabase, authenticateAdmin } from '../_utils.js';

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

    if (req.method === 'GET') {
        try {
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, username, email, created_at, is_banned')
                .order('created_at', { ascending: false });

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id');

            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id');

            if (usersError) throw usersError;
            if (productsError) throw productsError;
            if (ordersError) throw ordersError;

            return res.json({
                users: users?.length || 0,
                products: products?.length || 0,
                orders: orders?.length || 0
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
