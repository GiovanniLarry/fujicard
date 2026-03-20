import adminLoginHandler from '../_logic/auth-admin-login.js';
export default async function handler(req, res) { return await adminLoginHandler(req, res); }
