import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all products with filtering
router.get('/', async (req, res) => {
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
      page = 1
    } = req.query;

    console.log('📦 Products API called with params:', { category, search, limit, page, featured });

    if (!supabase) {
      return res.status(500).json({ error: 'Fatal: Supabase connection unavailable' });
    }

    // Build query - start with products and join categories
    let query = supabase
      .from('products')
      .select(`
        *,
        categories!inner(
          id,
          name
        )
      `, { count: 'estimated' });

    // Filter by category
    if (category) {
      query = query.eq('categories.name', category);
    }

    // Search by name or description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by price range
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Filter by rarity
    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    // Filter by condition
    if (condition) {
      query = query.eq('condition', condition);
    }

    // Filter by language
    if (language) {
      query = query.eq('language', language);
    }

    // Filter by set
    if (set) {
      query = query.eq('set_name', set);
    }

    // Filter featured
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Sorting
    if (sort) {
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
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const pageSize = limit ? parseInt(limit) : 12;
    const currentPage = parseInt(page);
    const startIndex = (currentPage - 1) * pageSize;

    query = query.range(startIndex, startIndex + pageSize - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Supabase database query failed' });
    }

    const totalPages = Math.ceil(count / pageSize);

    res.json({
      products,
      pagination: {
        currentPage,
        totalPages,
        totalProducts: count,
        hasMore: currentPage < totalPages
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server parameters parsing exception' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          image_url
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get related products (same category, different product)
    const { data: related } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .neq('id', req.params.id)
      .limit(4);

    res.json({ product, related: related || [] });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase.from('products').select(`
      rarity, 
      condition, 
      language, 
      set_name,
      categories!inner(
        name
      )
    `);

    if (category) {
      query = query.eq('categories.name', category);
    }

    const { data } = await query;

    const rarities = [...new Set(data.map(p => p.rarity).filter(r => r && r !== 'N/A'))];
    const conditions = [...new Set(data.map(p => p.condition))];
    const languages = [...new Set(data.map(p => p.language).filter(l => l && l !== 'N/A'))];
    const sets = [...new Set(data.map(p => p.set_name).filter(s => s && s !== 'N/A'))];

    res.json({ rarities, conditions, languages, sets });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
