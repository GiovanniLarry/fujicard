import cryptoWalletsHandler from './_logic/crypto-wallets.js';
export default async function handler(req, res) {
    return await cryptoWalletsHandler(req, res);
}
