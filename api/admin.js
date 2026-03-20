const statsHandler = require('./_logic/admin-stats.js');
const productsHandler = require('./_logic/admin-products.js');
const productsIdHandler = require('./_logic/admin-products-byId.js');
const categoriesHandler = require('./_logic/admin-categories.js');
const categoriesIdHandler = require('./_logic/admin-categories-byId.js');
const ordersHandler = require('./_logic/admin-orders.js');
const ordersIdHandler = require('./_logic/admin-orders-byId.js');
const usersHandler = require('./_logic/admin-users.js');
const usersMgmtHandler = require('./_logic/admin-users-management.js');
const notificationsHandler = require('./_logic/admin-notifications.js');
const paystackHandler = require('./_logic/admin-paystack-config.js');
const analyticsHandler = require('./_logic/admin-analytics.js');
const profileHandler = require('./_logic/admin-profile.js');

module.exports = async function handler(req, res) {
    const { route, id } = req.query;

    if (route === 'stats') return await statsHandler(req, res);
    if (route === 'analytics') return await analyticsHandler(req, res);
    if (route === 'notifications') return await notificationsHandler(req, res);
    if (route === 'paystack-config') return await paystackHandler(req, res);
    if (route === 'profile') return await profileHandler(req, res);
    if (route === 'users') return await usersHandler(req, res);
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
};
