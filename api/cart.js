import cartHandler from './_logic/cart.js';
export default async function handler(req, res) {
    return await cartHandler(req, res);
}
