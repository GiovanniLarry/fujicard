import crypto from 'crypto';

const MOCK_ORDER_ID = 'test-order-123';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || null;

const pfData = {
    m_payment_id: MOCK_ORDER_ID,
    pf_payment_id: '1084242',
    payment_status: 'COMPLETE',
    item_name: 'Fuji Card Shop Mock Order',
    item_description: '',
    amount_gross: '500.00',
    amount_fee: '-11.50',
    amount_net: '488.50',
    custom_str1: '',
    custom_str2: '',
    custom_str3: '',
    custom_str4: '',
    custom_str5: '',
    custom_int1: '',
    custom_int2: '',
    custom_int3: '',
    custom_int4: '',
    custom_int5: '',
    name_first: 'John',
    name_last: 'Doe',
    email_address: 'john@example.com',
    merchant_id: '22427478'
};

const generatePayfastSignature = (data, passPhrase = null) => {
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== "") {
                pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, "+")}&`;
            }
        }
    }
    let getString = pfOutput.slice(0, -1);
    if (passPhrase) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }
    return crypto.createHash("md5").update(getString).digest("hex");
};

const signature = generatePayfastSignature(pfData, PASSPHRASE);
pfData.signature = signature;

const formBody = new URLSearchParams();
for (const [k, v] of Object.entries(pfData)) {
    formBody.append(k, v);
}

fetch('http://localhost:5000/api/orders/payfast/notify', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody.toString()
})
    .then(res => res.text())
    .then(text => console.log('Response:', text))
    .catch(err => console.error(err));
