import productsIdHandler from './_logic/admin-products-byId.js';
import categoriesIdHandler from './_logic/admin-categories-byId.js';
import ordersIdHandler from './_logic/admin-orders-byId.js';
import statsHandler from './_logic/admin-stats.js';
import notificationsHandler from './_logic/admin-notifications.js';
import usersHandler from './_logic/admin-users.js';
import analyticsHandler from './_logic/admin-analytics.js';
import productsHandler from './_logic/admin-products.js';
import ordersHandler from './_logic/admin-orders.js';
import categoriesHandler from './_logic/admin-categories.js';
import paystackConfigHandler from './_logic/admin-paystack-config.js';
import profileHandler from './_logic/admin-profile.js';
import usersMgmtHandler from './_logic/admin-users-management.js';

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
