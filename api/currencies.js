import currenciesHandler from './_logic/currencies.js';
export default async function handler(req, res) {
    return await currenciesHandler(req, res);
}
