import loginHandler from '../_logic/auth-login.js';
export default async function handler(req, res) { return await loginHandler(req, res); }
