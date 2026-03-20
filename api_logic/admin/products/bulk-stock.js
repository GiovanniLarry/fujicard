import { supabase, authenticateAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // PUT - Bulk stock update
    if (req.method === 'PUT') {
        const { productIds, stockToAdd } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'No products selected' });
        }

        const addedStock = parseInt(stockToAdd, 10);
        if (isNaN(addedStock) || addedStock <= 0) {
            return res.status(400).json({ error: 'Invalid stock number' });
        }

        try {
            await Promise.all(productIds.map(async (pid) => {
                const { data: product } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', pid)
                    .single();

                const currentStock = product?.stock ?? 0;
                await supabase
                    .from('products')
                    .update({ stock: currentStock + addedStock })
                    .eq('id', pid);
            }));

            return res.json({ message: 'Stock updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update stock' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
