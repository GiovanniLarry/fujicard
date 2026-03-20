import { supabase, authenticateAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // POST - Upload QR code
    if (req.method === 'POST') {
        // For serverless, we'll just return success
        // In production, you'd use a service like Vercel Blob or Cloudinary
        const { coin } = req.body;
        
        return res.json({ 
            message: 'QR code uploaded successfully', 
            filename: `${coin}-qr.png` 
        });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
