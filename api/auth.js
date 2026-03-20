import loginHandler from './_logic/auth/login.js';
import registerHandler from './_logic/auth/register.js';
import meHandler from './_logic/auth/me.js';
import profileHandler from './_logic/auth/profile.js';
import adminLoginHandler from './_logic/auth/admin-login.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { route } = req.query;
        console.log(`[Auth Router] Route: ${route}, URL: ${req.url}`);

        if (route === 'login') return await loginHandler(req, res);
        if (route === 'register') return await registerHandler(req, res);
        if (route === 'me') return await meHandler(req, res);
        if (route === 'profile') return await profileHandler(req, res);
        if (route === 'admin-login') return await adminLoginHandler(req, res);

        // Fallback
        const url = req.url || '';
        if (url.includes('/login') && !url.includes('/admin-login')) return await loginHandler(req, res);
        if (url.includes('/admin-login')) return await adminLoginHandler(req, res);

        return res.status(404).json({
            error: 'Auth endpoint not found',
            debug: { route, url: req.url }
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
