import { createClient } from '@supabase/supabase-js';
import * as jwt_pkg from 'jsonwebtoken';

// Handle both default and named imports for jsonwebtoken in ESM
const jwt = jwt_pkg.default || jwt_pkg;

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient;
try {
    supabaseClient = (supabaseUrl && supabaseKey)
        ? createClient(supabaseUrl, supabaseKey)
        : null;
} catch (e) {
    console.error('Supabase init error:', e);
    supabaseClient = null;
}

export const supabase = supabaseClient || {
    from: (table) => ({
        select: () => ({
            eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }) }),
            order: () => Promise.resolve({ data: [], error: { message: 'Supabase client not initialized' } })
        }),
        upsert: () => Promise.resolve({ error: { message: 'Supabase client not initialized' } }),
        update: () => Promise.resolve({ error: { message: 'Supabase client not initialized' } }),
        delete: () => Promise.resolve({ error: { message: 'Supabase client not initialized' } })
    })
};

export const JWT_SECRET = process.env.JWT_SECRET || 'fujicard-secret-key-2024-change-in-production';

export function authenticateAdmin(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        if (user.role !== 'admin') return null;
        return user;
    } catch { return null; }
}

export function requireAdmin(req, res) {
    const user = authenticateAdmin(req);
    if (!user) { res.status(401).json({ error: "Not authenticated" }); return null; }
    return user;
}

export function authenticateUser(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function getCartKey(req) {
    const user = authenticateUser(req);
    if (user) return user.id;
    return req.headers['x-session-id'] || 'guest';
}
