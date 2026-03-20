import registerHandler from '../_logic/auth-register.js';
export default async function handler(req, res) { return await registerHandler(req, res); }
