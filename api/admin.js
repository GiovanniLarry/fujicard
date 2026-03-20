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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const url = req.url || '';
        const parts = url.split('/').filter(Boolean);
        const subRoute = parts.slice(2);

        if (subRoute[0] === 'products') {
            if (subRoute[1]) {
                req.query = { ...req.query, id: subRoute[1] };
                return await productsIdHandler(req, res);
            }
            return await productsHandler(req, res);
        }

        if (subRoute[0] === 'categories') {
            if (subRoute[1]) {
                req.query = { ...req.query, id: subRoute[1] };
                return await categoriesIdHandler(req, res);
            }
            return await categoriesHandler(req, res);
        }

        if (subRoute[0] === 'orders') {
            if (subRoute[1]) {
                req.query = { ...req.query, id: subRoute[1] };
                return await ordersIdHandler(req, res);
            }
            return await ordersHandler(req, res);
        }

        if (subRoute[0] === 'stats') return await statsHandler(req, res);
        if (subRoute[0] === 'notifications') return await notificationsHandler(req, res);
        if (subRoute[0] === 'paystack-config') return await paystackConfigHandler(req, res);
        if (subRoute[0] === 'users') return await usersHandler(req, res);
        if (subRoute[0] === 'users-management') return await usersMgmtHandler(req, res);

        return res.status(404).json({
            error: 'Admin endpoint not found',
            debug: { url, method: req.method }
        });
    } catch (error) {
        console.error('[Admin Router] CRASH:', error);
        return res.status(500).json({
            error: 'Internal Server Error (api/admin.js)',
            message: error.message,
            stack: error.stack
        });
    }
}
