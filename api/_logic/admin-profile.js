import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    const user = authenticateAdmin(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    try {
        if (req.method === 'GET') {
            return res.json(user);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
