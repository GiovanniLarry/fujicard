// Diagnostic Mock Utils
export const supabase = {
    from: (table) => ({
        select: () => ({
            eq: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }),
            order: () => Promise.resolve({ data: [], error: null }),
            count: 'exact',
            head: true
        }),
        insert: () => Promise.resolve({ error: null }),
        update: () => Promise.resolve({ error: null }),
        upsert: () => Promise.resolve({ error: null }),
        delete: () => Promise.resolve({ error: null })
    })
};

export const JWT_SECRET = 'diagnostic-secret';

export function authenticateAdmin(req) {
    // Force allow for diagnosis if needed, or return null to trigger 401
    return null;
}

export function requireAdmin(req, res) {
    res.status(401).json({ error: 'Diagnostic Mock 401' });
    return null;
}

export function generateToken(user) { return 'mock-token'; }
export function authenticateUser(req) { return null; }
export function requireAuth(req, res) { return null; }
export function getCartKey(req) { return 'guest'; }
