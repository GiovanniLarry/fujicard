// Native fetch in Node 18+

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuserrr',
                email: 'testtt@example.com',
                password: 'password123!'
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (err) {
        console.error('Error:', err);
    }
}
test();
