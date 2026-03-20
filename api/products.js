import { supabase } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const {
                category,
                search,
                minPrice,
                maxPrice,
                rarity,
                condition,
                language,
                set,
                sort,
                featured,
                limit,
                page = '1'
            } = req.query;

            if (!supabase) {
                return res.status(500).json({ error: 'Supabase not configured' });
            }

            // Match the server Express API contract used by the React UI.
            // The UI expects: { products: [...], pagination: {...} }
            let query = supabase
                .from('products')
                .select(`
                    *,
                    categories!inner(
                        id,
                        name
                    )
                `, { count: 'estimated' });

            if (category) query = query.eq('categories.name', category);
            if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
            if (minPrice) query = query.gte('price', parseFloat(minPrice));
            if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
            if (rarity) query = query.eq('rarity', rarity);
            if (condition) query = query.eq('condition', condition);
            if (language) query = query.eq('language', language);
            if (set) query = query.eq('set_name', set);
            if (featured === 'true') query = query.eq('featured', true);

            // Sorting
            switch (sort) {
                case 'price_asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'name_asc':
                    query = query.order('name', { ascending: true });
                    break;
                case 'name_desc':
                    query = query.order('name', { ascending: false });
                    break;
                case 'newest':
                    query = query.order('created_at', { ascending: false });
                    break;
                default:
                    query = query.order('created_at', { ascending: false });
            }

            // Pagination
            const pageSize = limit ? parseInt(limit, 10) : 12;
            const currentPage = parseInt(page, 10) || 1;
            const startIndex = (currentPage - 1) * pageSize;
            query = query.range(startIndex, startIndex + pageSize - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            const products = (data || []).map((p) => {
                // Normalize category field for ProductCard.
                // ProductCard checks `product.category` first, then `product.categories?.name`.
                const categoryName =
                    p.category ||
                    p.categories?.name ||
                    (Array.isArray(p.categories) ? p.categories[0]?.name : undefined);
                return {
                    ...p,
                    category: categoryName
                };
            });

            const totalProducts = typeof count === 'number' ? count : products.length;
            const totalPages = Math.ceil(totalProducts / pageSize) || 1;

            return res.json({
                products,
                pagination: {
                    currentPage,
                    totalPages,
                    totalProducts,
                    hasMore: currentPage < totalPages
                }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
