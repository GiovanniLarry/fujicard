import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // POST - Add category
    if (req.method === 'POST') {
        const { name } = req.body;

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name }])
                .select()
                .single();

            if (error) throw error;
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to add category' });
        }
    }

    // DELETE - Delete category
    if (req.method === 'DELETE') {
        const { id } = req.query;

        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Category deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete category' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
