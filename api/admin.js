import statsHandler from './_logic/admin-stats.js';
import productsHandler from './_logic/admin-products.js';
import productsIdHandler from './_logic/admin-products-byId.js';
import categoriesHandler from './_logic/admin-categories.js';
import categoriesIdHandler from './_logic/admin-categories-byId.js';
import ordersHandler from './_logic/admin-orders.js';
import ordersIdHandler from './_logic/admin-orders-byId.js';
import usersHandler from './_logic/admin-users.js';
import usersMgmtHandler from './_logic/admin-users-management.js';
import notificationsHandler from './_logic/admin-notifications.js';
import paystackHandler from './_logic/admin-paystack-config.js';
import analyticsHandler from './_logic/admin-analytics.js';
import profileHandler from './_logic/admin-profile.js';

export default async function handler(req, res) {
    const { route, id } = req.query;

    if (route === 'stats') return await statsHandler(req, res);
    if (route === 'analytics') return await analyticsHandler(req, res);
    if (route === 'notifications') return await notificationsHandler(req, res);
    if (route === 'paystack-config') return await paystackHandler(req, res);
    if (route === 'profile') return await profileHandler(req, res);
    if (route === 'users') return await usersHandler(req, res)
    if (route === 'users-management') return await usersMgmtHandler(req, res);

    if (route === 'products') {
        if (id) return await productsIdHandler(req, res);
        return await productsHandler(req, res);
    }
    if (route === 'categories') {
        if (id) return await categoriesIdHandler(req, res);
        return await categoriesHandler(req, res);
    }
    if (route === 'orders') {
        if (id) return await ordersIdHandler(req, res);
        return await ordersHandler(req, res);
    }

    return res.status(404).json({ error: 'Admin endpoint not found', route });
}
