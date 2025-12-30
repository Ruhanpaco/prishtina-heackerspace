const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log('Host:', process.env.EMAIL_HOST);
    // console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER);
    console.log('From:', process.env.EMAIL_FROM);

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('❌ Missing EMAIL environment variables.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        console.log('Verifying transporter connection...');
        await transporter.verify();
        console.log('✅ Transporter connection successful!');

    } catch (error) {
        console.error('❌ Email Error:', error);
    }
}

testEmail();
