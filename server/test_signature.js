import fs from 'fs';
import crypto from 'crypto';

const generatePayfastSignature = (data, passPhrase = null) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) {
        if (v !== undefined && v !== null && v.toString().trim() !== '') {
            p.append(k, v.toString().trim());
        }
    }
    let str = p.toString();
    // PayFast needs %20 replaced with +
    str = str.replace(/%20/g, '+');
    if (passPhrase) {
        str += '&passphrase=' + encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+');
    }
    return { getString: str, hash: crypto.createHash("md5").update(str).digest("hex") };
};

const payload = {
    merchant_id: '10000100',
    merchant_key: '46f0cd694581a',
    return_url: 'https://www.example.com/success',
    cancel_url: 'https://www.example.com/cancel',
    notify_url: 'https://www.example.com/notify',
    name_first: 'John',
    name_last: 'Doe',
    email_address: 'john@doe.com',
    m_payment_id: '1234',
    amount: '100.00',
    item_name: 'Test Item'
};

const result = generatePayfastSignature(payload);
fs.writeFileSync('signature_debug.json', JSON.stringify(result, null, 2));
