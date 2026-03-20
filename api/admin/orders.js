import ordersHandler from '../_logic/admin-orders.js';
import ordersIdHandler from '../_logic/admin-orders-byId.js';
export default async function handler(req, res) {
    if (req.query.id) return await ordersIdHandler(req, res);
    return await ordersHandler(req, res);
}
