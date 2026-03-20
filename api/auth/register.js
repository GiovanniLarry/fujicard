import { supabase, generateToken, requireAdmin } from '../_utils.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, password_hash: hashedPassword }])
            .select()
            .single();

        if (error) {
            if (error.message?.includes('duplicate') || error.code === '23505') {
                return res.status(409).json({ error: 'Username or email already exists' });
            }
            return res.status(500).json({ error: 'Registration failed', details: error.message });
        }

        const token = generateToken(data);
        return res.json({ token, user: { id: data.id, username: data.username, email: data.email } });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
