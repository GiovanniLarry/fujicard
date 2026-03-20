import loginHandler from '../api_logic/auth/login.js';
import registerHandler from '../api_logic/auth/register.js';
import meHandler from '../api_logic/auth/me.js';
import profileHandler from '../api_logic/auth/profile.js';
import adminLoginHandler from '../api_logic/auth/admin-login.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const url = req.url || '';
        if (url.includes('/login') && !url.includes('/admin-login')) return await loginHandler(req, res);
        if (url.includes('/register')) return await registerHandler(req, res);
        if (url.includes('/me')) return await meHandler(req, res);
        if (url.includes('/profile')) return await profileHandler(req, res);
        if (url.includes('/admin-login')) return await adminLoginHandler(req, res);

        return res.status(404).json({
            error: 'Auth endpoint not found',
            debug: { url, method: req.method }
        });
    } catch (error) {
        console.error('[Auth Router] CRASH:', error);
        return res.status(500).json({
            error: 'Internal Server Error (api/auth.js)',
            message: error.message,
            stack: error.stack
        });
    }
}
