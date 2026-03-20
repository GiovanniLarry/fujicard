const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: (table) => ({
            select: () => ({
                eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase URL/Key missing.' } }) }),
                order: () => Promise.resolve({ data: [], error: { message: 'Supabase URL/Key missing.' } })
            }),
            upsert: () => Promise.resolve({ error: { message: 'Supabase URL/Key missing.' } }),
            update: () => Promise.resolve({ error: { message: 'Supabase URL/Key missing.' } }),
            delete: () => Promise.resolve({ error: { message: 'Supabase URL/Key missing.' } })
        })
    };

const JWT_SECRET = process.env.JWT_SECRET || 'fujicard-secret-key-2024-change-in-production';

function authenticateAdmin(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        if (user.role !== 'admin') return null;
        return user;
    } catch (e) { return null; }
}

function requireAdmin(req, res) {
    const user = authenticateAdmin(req);
    if (!user) { res.status(401).json({ error: 'Not authenticated' }); return null; }
    return user;
}

function authenticateUser(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    try { return jwt.verify(token, JWT_SECRET); } catch (e) { return null; }
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function getCartKey(req) {
    const user = authenticateUser(req);
    if (user) return user.id;
    return req.headers['x-session-id'] || 'guest';
}

module.exports = {
    supabase,
    JWT_SECRET,
    authenticateAdmin,
    requireAdmin,
    authenticateUser,
    generateToken,
    getCartKey
};
