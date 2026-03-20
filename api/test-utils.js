import { JWT_SECRET } from './_logic/_utils.js';
export default async function handler(req, res) {
    return res.json({ status: 'ok', secret_prefix: (JWT_SECRET || '').substring(0, 5) });
}
