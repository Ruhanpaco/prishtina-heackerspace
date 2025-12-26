import nodemailer from 'nodemailer';

const smtpConfig = {
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

type EmailPayload = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};

export const sendEmail = async (data: EmailPayload) => {
    const { to, subject, html, text } = data;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback text generation
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};
