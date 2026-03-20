import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Not authenticated' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Product ID required' });

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'PUT') {
            const { error } = await supabase.from('products').update(req.body).eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Product updated' });
        }

        if (req.method === 'DELETE') {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Product deleted' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
