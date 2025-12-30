const nodemailer = require('nodemailer');

// Create a transporter function to ensure it's created at runtime
const getTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

const FLOSSK_LOGO_URL = 'https://prhs-bata.ruhanpacolli.online/assets/images/logos/FLOSSK%20Logo%20Black.png';

export async function sendPasswordResetEmail(
    email: string,
    resetToken: string,
    securityKey: string
) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&key=${securityKey}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@flossk.org',
        to: email,
        subject: 'Reset Your Password - Prishtina Hackerspace',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header with Logo -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <img src="${FLOSSK_LOGO_URL}" alt="FLOSSK Logo" style="max-width: 200px; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Title -->
                    <tr>
                        <td align="center" style="padding: 0 40px 20px 40px;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Reset Your Password</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                                We received a request to reset your password for your Prishtina Hackerspace account.
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                                Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Button -->
                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Reset Password</a>
                        </td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0066cc; word-break: break-all;">
                                ${resetUrl}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Security Warning -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #d32f2f;">
                                ⚠️ <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact us immediately at <a href="mailto:info@flossk.org" style="color: #d32f2f;">info@flossk.org</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 30px 40px; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                                Prishtina Hackerspace
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                Operated by FLOSSK (Free Libre Open Source Software Kosova)
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    await getTransporter().sendMail(mailOptions);
}
