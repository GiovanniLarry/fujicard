import { supabase, authenticateAdmin } from '../_utils.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!authenticateAdmin(req)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // PUT - Update crypto wallet
    if (req.method === 'PUT') {
        const { symbol } = req.query;
        const { address, trustLink } = req.body;

        // In-memory config (would need DB for persistence)
        const cryptoWalletConfig = {
            BTC: { address: 'bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap', trustLink: 'https://link.trustwallet.com/send?address=bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap&asset=c0' },
            ETH: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60' },
            USDT: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?asset=c60_t0xdAC17F958D2ee523a2206206994597C13D831ec7&address=0x8101625364B48146ea92E1FEeB48fd90c852a215' },
            USDC: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60_t0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
            LTC: { address: 'ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66', trustLink: 'https://link.trustwallet.com/send?asset=c2&address=ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66' }
        };

        if (!cryptoWalletConfig[symbol]) {
            return res.status(404).json({ error: 'Unknown coin' });
        }

        cryptoWalletConfig[symbol] = { ...cryptoWalletConfig[symbol], address, trustLink };
        return res.json({ message: `${symbol} wallet updated`, config: cryptoWalletConfig[symbol] });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
