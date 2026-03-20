import { supabase } from '../../../_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { category } = req.query;

    let query = supabase
      .from('products')
      .select(`
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

    const { data, error } = await query;
    if (error) throw error;

    const categories = [...new Set((data || []).map((p) => p.categories?.name).filter(Boolean))];
    const rarities = [...new Set((data || []).map((p) => p.rarity).filter((r) => r && r !== 'N/A'))];
    const conditions = [...new Set((data || []).map((p) => p.condition).filter(Boolean))];
    const languages = [...new Set((data || []).map((p) => p.language).filter((l) => l && l !== 'N/A'))];
    const sets = [...new Set((data || []).map((p) => p.set_name).filter((s) => s && s !== 'N/A'))];

    res.json({ categories, rarities, conditions, languages, sets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
}

