import express from 'express';
import { supabase } from '../config/supabase.js';
import { categories as fallbackCategories, products } from '../data/store.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    // If Supabase is not available, use fallback data
    if (!supabase) {
      console.log('⚠️  Using fallback categories data (Supabase not configured)');
      
      // Count products for each category
      const categoriesWithCount = fallbackCategories.map(cat => {
        const productCount = products.filter(p => p.category === cat.id).length;
        return {
          ...cat,
          productCount
        };
      });
      
      return res.json({ categories: categoriesWithCount });
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        product_count:products(count)
      `);

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to local data if Supabase fails
      console.log('⚠️  Falling back to local categories data due to Supabase error');
      const categoriesWithCount = fallbackCategories.map(cat => {
        const productCount = products.filter(p => p.category === cat.id).length;
        return {
          ...cat,
          productCount
        };
      });
      return res.json({ categories: categoriesWithCount });
    }

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      productCount: cat.product_count?.[0]?.count || 0
    }));
    
    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Server error:', error);
    // Fallback to local data on any error
    console.log('⚠️  Falling back to local categories data due to server error');
    const categoriesWithCount = fallbackCategories.map(cat => {
      const productCount = products.filter(p => p.category === cat.id).length;
      return {
        ...cat,
        productCount
      };
    });
    res.json({ categories: categoriesWithCount });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    // First get the category
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('name', req.params.id)
      .single();

    if (error || !category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Count products in this category
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id);

    res.json({ 
      category,
      productCount: count || 0
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
