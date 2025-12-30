const mongoose = require('mongoose');

// Assuming standard path for DB connect logic in scripts
const MONGO_URI = 'mongodb://127.0.0.1:27017/prhs'; // Guessing based on common setup

async function checkThreats() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const threats = await mongoose.connection.collection('security_threats').find({ ipAddress: '127.0.0.1' }).toArray();
        console.log("Found Threats:", JSON.stringify(threats, null, 2));

        const logs = await mongoose.connection.collection('audit_logs').countDocuments({ "context.ip_address": '127.0.0.1' });
        console.log("Audit Logs for 127.0.0.1:", logs);

        await mongoose.disconnect();
    } catch (error) {
        console.error("DB Check Failed:", error.message);
    }
}

checkThreats();
