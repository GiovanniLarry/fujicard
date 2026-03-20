import paystackHandler from '../_logic/admin-paystack-config.js';
export default async function handler(req, res) { return await paystackHandler(req, res); }
