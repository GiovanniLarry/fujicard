import { supabase } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const { id, featured, limit, category, search } = req.query;

            if (id) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                return res.json(data);
            }

            let query = supabase
                .from('products')
                .select('*, categories!inner(name)');

            if (featured === 'true') {
                query = query.eq('featured', true);
            }

            if (category) {
                query = query.ilike('categories.name', `%${category}%`);
            }

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            query = query.order('created_at', { ascending: false });

            if (limit) {
                query = query.limit(parseInt(limit));
            }

            const { data, error } = await query;
            if (error) throw error;

            // CRITICAL: Frontend expects an object with a products array
            return res.json({ products: data || [] });
        } catch (error) {
            console.error('Products fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
