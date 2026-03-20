const cartHandler = require('./_logic/cart.js');
const ordersHandler = require('./_logic/orders.js');
const currenciesHandler = require('./_logic/currencies.js');
const cryptoHandler = require('./_logic/crypto-wallets.js');

module.exports = async function handler(req, res) {
    const { route } = req.query;
    if (route === 'cart') return await cartHandler(req, res);
    if (route === 'orders') return await ordersHandler(req, res);
    if (route === 'currencies') return await currenciesHandler(req, res);
    if (route === 'crypto-wallets') return await cryptoHandler(req, res);
    return res.status(404).json({ error: 'Customer endpoint not found', route });
};
