import { supabase } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            return res.json({ categories: data || [] });
        } catch (error) {
            console.error('Categories fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
