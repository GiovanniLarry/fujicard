import cartHandler from './_logic/cart.js';
import ordersHandler from './_logic/orders.js';
import currenciesHandler from './_logic/currencies.js';
import cryptoHandler from './_logic/crypto-wallets.js';

export default async function handler(req, res) {
    const { route } = req.query;
    if (route === 'cart') return await cartHandler(req, res);
    if (route === 'orders') return await ordersHandler(req, res);
    if (route === 'currencies') return await currenciesHandler(req, res);
    if (route === 'crypto-wallets') return await cryptoHandler(req, res);
    return res.status(404).json({ error: 'Customer endpoint not found', route });
}
