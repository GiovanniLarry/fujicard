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

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { route } = req.query;
        console.log(`[Admin Router] Route: ${route}, URL: ${req.url}`);

        if (route === 'products') {
            const id = req.query.id;
            if (id) return await productsIdHandler(req, res);
            return await productsHandler(req, res);
        }

        if (route === 'categories') {
            const id = req.query.id;
            if (id) return await categoriesIdHandler(req, res);
            return await categoriesHandler(req, res);
        }

        if (route === 'orders') {
            const id = req.query.id;
            if (id) return await ordersIdHandler(req, res);
            return await ordersHandler(req, res);
        }

        if (route === 'stats') return await statsHandler(req, res);
        if (route === 'notifications') return await notificationsHandler(req, res);
        if (route === 'paystack-config') return await paystackConfigHandler(req, res);
        if (route === 'users') return await usersHandler(req, res);
        if (route === 'users-management') return await usersMgmtHandler(req, res);

        return res.status(404).json({
            error: 'Admin endpoint not found',
            debug: { route, url: req.url, query: req.query }
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
