import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Category ID required' });

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'PUT') {
            const { error } = await supabase.from('categories').update(req.body).eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Category updated' });
        }

        if (req.method === 'DELETE') {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Category deleted' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
