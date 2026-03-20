import loginHandler from './_logic/auth-login.js';
import registerHandler from './_logic/auth-register.js';
import profileHandler from './_logic/auth-profile.js';
import meHandler from './_logic/auth-me.js';
import adminLoginHandler from './_logic/auth-admin-login.js';

export default async function handler(req, res) {
    const { route } = req.query;
    if (route === 'login') return await loginHandler(req, res);
    if (route === 'register') return await registerHandler(req, res);
    if (route === 'profile') return await profileHandler(req, res);
    if (route === 'me') return await meHandler(req, res);
    if (route === 'admin-login') return await adminLoginHandler(req, res);
    return res.status(404).json({ error: 'Auth endpoint not found', route });
}
