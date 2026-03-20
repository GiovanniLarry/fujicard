import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const { data: users } = await supabase.from('users').select('created_at');
        const { data: orders } = await supabase.from('orders').select('total, created_at');

        // Simple aggregate for analytics
        const totalRevenue = orders?.reduce((acc, o) => acc + parseFloat(o.total || 0), 0) || 0;

        return res.json({
            totalUsers: users?.length || 0,
            totalOrders: orders?.length || 0,
            totalRevenue: totalRevenue.toFixed(2),
            currency: 'ZAR'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
