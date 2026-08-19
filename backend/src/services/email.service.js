/**
 * Email Service for OTP and Authentication Notifications.
 * Supports SMTP transport if configured in .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS),
 * otherwise logs the OTP clearly to the terminal in development.
 */

// Generate a random 6-digit numeric OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send an OTP code to an email.
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - 'login' | 'forgot_password'
 */
export const sendOtpEmail = async (email, otp, purpose = 'login') => {
  const isForgotPassword = purpose === 'forgot_password';
  const subject = isForgotPassword
    ? 'CodeRank — Password Reset OTP Code'
    : 'CodeRank — Login OTP Verification Code';

  const actionText = isForgotPassword
    ? 'reset your account password'
    : 'sign in to your CodeRank account';

  console.log('\n========================================');
  console.log(`🔑 [OTP DISPATCH] (${purpose.toUpperCase()})`);
  console.log(`📧 Target Email : ${email}`);
  console.log(`🔢 Verification Code: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log('========================================\n');

  // If SMTP environment variables are set, attempt sending via nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'CodeRank'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #334155;">
            <h2 style="color: #6366f1; margin-bottom: 8px;">CodeRank</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">Your DSA Preparation Partner</p>
            <div style="background: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 12px;">Use the verification code below to ${actionText}:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #6366f1; font-family: monospace; padding: 10px; background: #0f172a; border-radius: 8px; display: inline-block;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 12px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            <p style="color: #64748b; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} CodeRank. All rights reserved.</p>
          </div>
        `,
      });
      console.log(`✅ Email successfully sent to ${email}`);
    } catch (err) {
      console.error(`⚠️ Failed to send SMTP email (logged OTP to console):`, err.message);
    }
  }

  return { success: true, message: 'OTP sent successfully' };
};
