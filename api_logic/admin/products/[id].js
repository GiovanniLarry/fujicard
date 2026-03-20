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

    // PUT - Update product
    if (req.method === 'PUT') {
        const { id } = req.query;
        const updateData = req.body;

        try {
            if (updateData.category_name) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('name', updateData.category_name)
                    .single();
                if (catData) updateData.category_id = catData.id;
                delete updateData.category_name;
            }

            delete updateData.id;
            delete updateData.categories;

            const { data, error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return res.json(data && data.length > 0 ? data[0] : { message: 'Updated' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update product' });
        }
    }

    // DELETE - Delete product
    if (req.method === 'DELETE') {
        const { id } = req.query;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Product deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete product' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
