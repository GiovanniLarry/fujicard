import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize only if keys are present to prevent top-level crash during import
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: (table) => {
            console.error(`[Supabase Mock] Table ${table} requested but URL/Key is missing!`);
            return { select: () => ({ order: () => Promise.resolve({ data: [], error: { message: 'Supabase URL/Key missing. Please check Vercel Env Vars.' } }) }) };
        }
    };

if (!supabaseUrl) console.error('[Supabase Init] WARNING: SUPABASE_URL is not defined');
if (!supabaseKey) console.error('[Supabase Init] WARNING: SUPABASE_KEY (ANON/SERVICE) is not defined');

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

export function getCartKey(req) {
    const user = authenticateUser(req);
    if (user) return user.id;
    return req.headers['x-session-id'] || 'guest';
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
