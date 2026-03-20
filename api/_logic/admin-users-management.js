import { supabase, authenticateAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // GET all users
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email, created_at, is_banned')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.json(data || []);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    // PUT - Update user ban status
    if (req.method === 'PUT') {
        const { id } = req.query;
        const { is_banned } = req.body;

        try {
            const { error } = await supabase
                .from('users')
                .update({ is_banned })
                .eq('id', id);

            if (error) throw error;
            return res.json({ message: 'User status updated' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update user status' });
        }
    }

    // DELETE - Delete user
    if (req.method === 'DELETE') {
        const { id } = req.query;

        try {
            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'User deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
