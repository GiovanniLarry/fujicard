import productsHandler from '../api_logic/products.js';
import categoriesHandler from '../api_logic/categories.js';
import currenciesHandler from '../api_logic/currencies.js';
import healthHandler from '../api_logic/health.js';
import ordersHandler from '../api_logic/orders.js';
import cartHandler from '../api_logic/cart.js';
import cryptoWalletsHandler from '../api_logic/crypto-wallets.js';

export default async function handler(req, res) {
    const url = req.url || '';

    if (url.includes('/products')) return productsHandler(req, res);
    if (url.includes('/categories')) return categoriesHandler(req, res);
    if (url.includes('/currencies')) return currenciesHandler(req, res);
    if (url.includes('/health')) return healthHandler(req, res);
    if (url.includes('/orders')) return ordersHandler(req, res);
    if (url.includes('/cart')) return cartHandler(req, res);
    if (url.includes('/crypto-wallets')) return cryptoWalletsHandler(req, res);

    return res.status(404).json({ error: 'Shop endpoint not found' });
}
