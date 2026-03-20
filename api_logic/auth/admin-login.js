import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { username, password } = req.body;

            const adminUser = process.env.ADMIN_USERNAME || 'fujiadmin';
            const adminPass = process.env.ADMIN_PASSWORD || 'fujisecret';

            if (username === adminUser && password === adminPass) {
                // Issue a specific token for admin
                const token = jwt.sign(
                    { id: 'fuji-admin', username: 'admin', role: 'admin' },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );
                return res.json({ message: 'Admin authenticated', token });
            }

            return res.status(401).json({ error: 'Invalid admin credentials' });
        } catch (error) {
            console.error('Admin login error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
