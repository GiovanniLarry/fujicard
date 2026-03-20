import loginHandler from '../api_logic/auth/login.js';
import registerHandler from '../api_logic/auth/register.js';
import meHandler from '../api_logic/auth/me.js';
import profileHandler from '../api_logic/auth/profile.js';
import adminLoginHandler from '../api_logic/auth/admin-login.js';

export default async function handler(req, res) {
    const url = req.url || '';

    // Simple routing based on URL subpath
    if (url.includes('/login') && !url.includes('/admin-login')) {
        return loginHandler(req, res);
    } else if (url.includes('/register')) {
        return registerHandler(req, res);
    } else if (url.includes('/me')) {
        return meHandler(req, res);
    } else if (url.includes('/profile')) {
        return profileHandler(req, res);
    } else if (url.includes('/admin-login')) {
        return adminLoginHandler(req, res);
    }

    return res.status(404).json({ error: 'Auth endpoint not found' });
}
