import { supabase, requireAdmin, authenticateAdmin } from '../_utils.js';

// In-memory configs (will persist in serverless for short periods)
let paystackConfig = {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    secretKey: process.env.PAYSTACK_SECRET_KEY || ''
};

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

    // GET Paystack config
    if (req.method === 'GET') {
        return res.json(paystackConfig);
    }

    // PUT - Update Paystack config
    if (req.method === 'PUT') {
        const { publicKey, secretKey } = req.body;
        paystackConfig = { publicKey: publicKey || '', secretKey: secretKey || '' };
        return res.json({ message: 'Paystack settings updated', config: paystackConfig });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
