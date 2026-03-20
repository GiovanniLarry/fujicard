import { supabase, authenticateAdmin } from './_utils.js';

// Default config if not in DB
const DEFAULT_WALLETS = {
    BTC: { address: 'bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap', trustLink: 'https://link.trustwallet.com/send?address=bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap&asset=c0' },
    ETH: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60' },
    USDT: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?asset=c60_t0xdAC17F958D2ee523a2206206994597C13D831ec7&address=0x8101625364B48146ea92E1FEeB48fd90c852a215' },
    USDC: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60_t0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    LTC: { address: 'ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66', trustLink: 'https://link.trustwallet.com/send?asset=c2&address=ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66' }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // GET - Public endpoint for wallets
        if (req.method === 'GET') {
            const { data, error } = await supabase.from('settings').select('*').eq('key', 'crypto_wallets').single();
            if (error && error.code !== 'PGRST116') throw error;
            return res.json(data?.value || DEFAULT_WALLETS);
        }

        // PUT - Update wallet (admin only)
        if (req.method === 'PUT') {
            if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Not authenticated' });

            const { symbol, address, trustLink } = req.body;

            // Get current
            const { data: currentData } = await supabase.from('settings').select('*').eq('key', 'crypto_wallets').single();
            let currentWallets = currentData?.value || { ...DEFAULT_WALLETS };

            if (!currentWallets[symbol]) return res.status(404).json({ error: 'Unknown coin' });

            currentWallets[symbol] = { ...currentWallets[symbol], address, trustLink };

            const { error } = await supabase.from('settings').upsert({
                key: 'crypto_wallets',
                value: currentWallets,
                updated_at: new Date()
            }, { onConflict: 'key' });

            if (error) throw error;
            return res.json({ message: `${symbol} wallet updated`, config: currentWallets[symbol] });
        }
    } catch (error) {
        console.error('[Crypto Wallets] Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to manage wallets' });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
