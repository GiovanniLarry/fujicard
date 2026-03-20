const loginHandler = require('./_logic/auth-login.js');
const registerHandler = require('./_logic/auth-register.js');
const profileHandler = require('./_logic/auth-profile.js');
const meHandler = require('./_logic/auth-me.js');
const adminLoginHandler = require('./_logic/auth-admin-login.js');

module.exports = async function handler(req, res) {
    const { route } = req.query;
    if (route === 'login') return await loginHandler(req, res);
    if (route === 'register') return await registerHandler(req, res);
    if (route === 'profile') return await profileHandler(req, res);
    if (route === 'me') return await meHandler(req, res);
    if (route === 'admin-login') return await adminLoginHandler(req, res);
    return res.status(404).json({ error: 'Auth endpoint not found', route });
};
