import statsHandler from './_logic/admin-stats.js';
export default async function handler(req, res) {
    return await statsHandler(req, res);
}
