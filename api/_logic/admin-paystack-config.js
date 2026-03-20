import { supabase, authenticateAdmin } from './_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // GET Paystack config from Supabase 'settings' table or fallback
        if (req.method === 'GET') {
            const { data, error } = await supabase.from('settings').select('*').eq('key', 'paystack_config').single();
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows found'

            const config = data?.value || {
                publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
                secretKey: process.env.PAYSTACK_SECRET_KEY || ''
            };
            return res.json(config);
        }

        // PUT - Update Paystack config in Supabase
        if (req.method === 'PUT') {
            const { publicKey, secretKey } = req.body;
            const newConfig = { publicKey: publicKey || '', secretKey: secretKey || '' };

            const { error } = await supabase.from('settings').upsert({
                key: 'paystack_config',
                value: newConfig,
                updated_at: new Date()
            }, { onConflict: 'key' });

            if (error) throw error;
            return res.json({ message: 'Paystack settings updated', config: newConfig });
        }
    } catch (error) {
        console.error('[Paystack Config] Error:', error);
        return res.status(500).json({
            error: 'Failed to manage Paystack config',
            details: typeof error === 'object' ? JSON.stringify(error) : error.toString()
        });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
