import productsHandler from '../api_logic/admin/products.js';
import productsIdHandler from '../api_logic/admin/products/[id].js';
import categoriesHandler from '../api_logic/admin/categories.js';
import categoriesIdHandler from '../api_logic/admin/categories/[id].js';
import ordersHandler from '../api_logic/admin/orders.js';
import ordersIdHandler from '../api_logic/admin/orders/[id].js';
import statsHandler from '../api_logic/admin/stats.js';
import notificationsHandler from '../api_logic/admin/notifications.js';
import paystackConfigHandler from '../api_logic/admin/paystack-config.js';
import usersHandler from '../api_logic/admin/users.js';
import usersMgmtHandler from '../api_logic/admin/users-management.js';

export default async function handler(req, res) {
    const url = req.url || '';
    const parts = url.split('/').filter(Boolean);

    console.log(`[Admin Router] Handling URL: ${url}`);

    // If the URL is just /api/admin or /api/admin/
    if (parts.length <= 2) {
        return res.json({ message: 'Admin API root' });
    }

    // Determine subRoute (after /api/admin/)
    const subRoute = parts.slice(2);

    if (subRoute[0] === 'products') {
        if (subRoute[1]) {
            req.query = { ...req.query, id: subRoute[1] };
            return productsIdHandler(req, res);
        }
        return productsHandler(req, res);
    }

    if (subRoute[0] === 'categories') {
        if (subRoute[1]) {
            req.query = { ...req.query, id: subRoute[1] };
            return categoriesIdHandler(req, res);
        }
        return categoriesHandler(req, res);
    }

    if (subRoute[0] === 'orders') {
        if (subRoute[1]) {
            req.query = { ...req.query, id: subRoute[1] };
            return ordersIdHandler(req, res);
        }
        return ordersHandler(req, res);
    }

    if (subRoute[0] === 'stats') return statsHandler(req, res);
    if (subRoute[0] === 'notifications') return notificationsHandler(req, res);
    if (subRoute[0] === 'paystack-config') return paystackConfigHandler(req, res);
    if (subRoute[0] === 'users') return usersHandler(req, res);
    if (subRoute[0] === 'users-management') return usersMgmtHandler(req, res);

    return res.status(404).json({
        error: 'Admin endpoint not found',
        debug: { url, parts, subRoute }
    });
}
