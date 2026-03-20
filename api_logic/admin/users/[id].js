import { supabase, authenticateAdmin } from '../../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
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

    // DELETE all users
    if (req.method === 'DELETE' && !req.query.id) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) throw error;
            return res.json({ message: 'All users deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete all users' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
