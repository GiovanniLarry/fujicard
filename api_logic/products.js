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

                // Transform for frontend compatibility if needed
                if (product && product.categories) {
                    product.category = product.categories.name;
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
                    related = relatedData || [];
                }

                return res.json({ product, related });
            }

            let query = supabase
                .from('products')
                .select('*, categories(name)');

            if (featured === 'true') {
                query = query.eq('featured', true);
            }

            if (category) {
                // This assumes category name filtering
                // For joined tables, ilike needs a different approach or filtering in JS
                // For now, let's keep it simple as the home page uses featured/limit mostly
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

            // Flatten category name for list view as well
            const transformedData = (data || []).map(p => ({
                ...p,
                category: p.categories?.name || 'Unknown'
            }));

            return res.json({ products: transformedData });
        } catch (error) {
            console.error('Products general error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
