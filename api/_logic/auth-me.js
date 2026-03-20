import { supabase, requireAuth } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        const userToken = requireAuth(req, res);
        if (!userToken) return;

        try {
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userToken.id)
                .single();

            if (userError || !user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                address: user.address || '',
                city: user.city || '',
                postcode: user.postcode || '',
                country: user.country || 'United Kingdom',
                phone: user.phone || '',
                created_at: user.created_at
            });
        } catch (error) {
            console.error('Get user error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
