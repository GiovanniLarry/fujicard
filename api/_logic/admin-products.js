import { supabase, authenticateAdmin } from './_utils.js';

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

    // GET all products
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.json(data || []);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    // POST new product
    if (req.method === 'POST') {
        const newProduct = req.body;

        try {
            if (newProduct.category_name) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('name', newProduct.category_name)
                    .single();
                if (catData) newProduct.category_id = catData.id;
                delete newProduct.category_name;
            }

            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select()
                .single();

            if (error) throw error;
            return res.json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to add product' });
        }
    }

    // PUT update product
    if (req.method === 'PUT') {
        const { id, ...updateData } = req.body;

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

    // DELETE product
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
