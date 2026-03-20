import ordersHandler from './_logic/orders.js';
export default async function handler(req, res) {
    return await ordersHandler(req, res);
}
