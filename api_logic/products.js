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
                // Fetch the main product
                const { data: product, error } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Product fetch error:', error);
                    return res.status(404).json({ error: 'Product not found' });
                }

                // Transform for frontend compatibility
                if (product) {
                    if (product.categories) product.category = product.categories.name;
                    if (product.image_url) product.image = product.image_url;
                }

                // Fetch related products (same category)
                let related = [];
                if (product.category_id) {
                    const { data: relatedData } = await supabase
                        .from('products')
                        .select('*, categories(name)')
                        .eq('category_id', product.category_id)
                        .neq('id', id)
                        .limit(4);

                    related = (relatedData || []).map(p => ({
                        ...p,
                        category: p.categories?.name || 'Unknown',
                        image: p.image || p.image_url
                    }));
                }

                return res.json({ product, related });
            }

            // Normal list view
            let query;
            if (category) {
                // If filtering by category, we MUST use !inner to filter the parent rows
                query = supabase
                    .from('products')
                    .select('*, categories!inner(name)')
                    .ilike('categories.name', `%${category}%`);
            } else {
                query = supabase
                    .from('products')
                    .select('*, categories(name)');
            }

            if (featured === 'true') {
                query = query.eq('featured', true);
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

            // Transform for frontend compatibility (flatten category and image)
            const transformedData = (data || []).map(p => ({
                ...p,
                category: p.categories?.name || 'Unknown',
                image: p.image || p.image_url
            }));

            return res.json({ products: transformedData });
        } catch (error) {
            console.error('Products general error:', error);
            const msg = error.message || 'Internal server error';
            return res.status(500).json({ error: msg });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
