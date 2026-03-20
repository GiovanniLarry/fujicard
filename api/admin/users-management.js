import usersMgmtHandler from '../_logic/admin-users-management.js';
export default async function handler(req, res) { return await usersMgmtHandler(req, res); }
