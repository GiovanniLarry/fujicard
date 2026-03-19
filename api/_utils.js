import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const JWT_SECRET = process.env.JWT_SECRET || 'fujicard-secret-key-2024-change-in-production';

export function authenticateAdmin(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return null;

    try {
        const user = jwt.verify(token, JWT_SECRET);
        if (user.role !== 'admin') return null;
        return user;
    } catch {
        return null;
    }
}

export function requireAdmin(req, res) {
    const user = authenticateAdmin(req);
    if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return null;
    }
    return user;
}

export function authenticateUser(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function requireAuth(req, res) {
    const user = authenticateUser(req);
    if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return null;
    }
    return user;
}

export function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}
