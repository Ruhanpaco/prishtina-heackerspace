async function simulateBruteForce() {
    console.log("🚀 Starting Brute Force Simulation...");
    const baseUrl = 'http://localhost:3000/api/v2/POST/auth/login';

    for (let i = 1; i <= 6; i++) {
        console.log(`📡 Attempt ${i}: Logging in with wrong credentials...`);
        try {
            const res = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '127.0.0.1', // Simulate a specific IP
                    'user-agent': 'Mozilla/5.0 (Security Bot Simulation)'
                },
                body: JSON.stringify({
                    email: 'victim@example.com',
                    password: 'wrongpassword' + i
                })
            });
            const data = await res.json();
            console.log(`❌ Attempt ${i} Response (${res.status}): ${data.message || 'Error'}`);
        } catch (error) {
            console.log(`❌ Attempt ${i} Failed: ${error.message}`);
        }
    }

    console.log("\n✅ Simulation Complete. Check the Security Intelligence dashboard for 'BRUTE_FORCE' threats from 127.0.0.1.");
}

simulateBruteForce();
