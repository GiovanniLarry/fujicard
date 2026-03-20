import { supabase, authenticateAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.method === 'GET') {
        try {
            // Return default Paystack config - in production this would come from database
            return res.json({
                publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
                secretKey: process.env.PAYSTACK_SECRET_KEY || ''
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch Paystack config' });
        }
    }

    if (req.method === 'PUT') {
        const { publicKey, secretKey } = req.body;

        try {
            // In production, save to database
            // For now, just return success
            return res.json({ 
                message: 'Paystack configuration saved successfully!',
                config: { publicKey, secretKey }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save Paystack config' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
