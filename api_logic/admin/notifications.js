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

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('id, order_number, total, currency, payment_method, created_at, user_id, users(username, email)')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        const notifications = data.map(order => ({
            id: order.id,
            order_number: order.order_number,
            amount: order.total,
            currency: order.currency,
            method: order.payment_method || 'Unknown',
            time: order.created_at,
            customer: order.users ? order.users.username : 'Guest Checkout',
            email: order.users ? order.users.email : 'N/A',
            isRead: false
        }));

        return res.json(notifications);
    } catch (error) {
        return res.status(500).json({ error: 'Failed' });
    }
}
