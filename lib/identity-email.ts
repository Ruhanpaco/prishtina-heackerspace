import { sendEmail } from "./email";

const APP_NAME = "Prishtina Hackerspace";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface EmailConfig {
    userName: string;
    email: string;
    details?: string;
}

export const sendIdentityApprovedEmail = async ({ userName, email }: EmailConfig) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 24px; text-align: center;">
            <h1 style="color: #FFC107; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Identity Verified</h1>
        </div>
        <div style="padding: 32px; color: #1a202c;">
            <p style="font-size: 18px; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
            <p>Great news! Your identity verification has been <strong>approved</strong> by the ${APP_NAME} staff.</p>
            <p>Your account now has full access to the space's digital and physical resources. You have also been awarded the <strong>Verified Member</strong> badge on your profile.</p>
            <div style="margin: 32px 0; text-align: center;">
                <a href="${APP_URL}/dashboard" style="background-color: #FFC107; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
            <p style="color: #718096; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
        </div>
        <div style="background-color: #f7fafc; padding: 16px; text-align: center; color: #a0aec0; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </div>
    </div>
    `;

    return sendEmail({
        to: email,
        subject: `[Verified] Your Identity at ${APP_NAME}`,
        html
    });
};

export const sendIdentityRejectedEmail = async ({ userName, email, details }: EmailConfig) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 24px; text-align: center;">
            <h1 style="color: #ef4444; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Verification Update</h1>
        </div>
        <div style="padding: 32px; color: #1a202c;">
            <p style="font-size: 18px; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
            <p>We've reviewed your identity documents, and unfortunately, we were unable to verify your identity at this time.</p>
            
            <div style="background-color: #fff5f5; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #ef4444;">Reason for Rejection:</h4>
                <p style="margin: 0;">${details || "The documents provided were unclear or did not match your profile information."}</p>
            </div>

            <p>Please log in to your dashboard and re-upload clear photos of your ID or Passport to resume the verification process.</p>
            
            <div style="margin: 32px 0; text-align: center;">
                <a href="${APP_URL}/dashboard/settings?tab=identity" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Re-upload Documents</a>
            </div>
            <p style="color: #718096; font-size: 14px;">If you believe this is an error, please contact our support team.</p>
        </div>
        <div style="background-color: #f7fafc; padding: 16px; text-align: center; color: #a0aec0; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </div>
    </div>
    `;

    return sendEmail({
        to: email,
        subject: `Identity Verification Update - ${APP_NAME}`,
        html
    });
};
