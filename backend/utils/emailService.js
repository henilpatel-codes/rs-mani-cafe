// utils/emailService.js — OTP and password reset emails
const nodemailer = require('nodemailer');

const shouldSkipEmail = () => {
  return (
    process.env.EMAIL_SKIP === 'true' ||
    process.env.SKIP_EMAIL === 'true' ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  );
};

const getTransporter = () => {
  if (shouldSkipEmail()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });
};

const getSenderEmail = () => {
  return process.env.EMAIL_FROM || process.env.SMTP_SENDER || process.env.SMTP_USER;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendWithTimeout = async (mailPromise) => {
  return Promise.race([
    mailPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email sending timeout')), 25000)
    ),
  ]);
};

const sendOTPEmail = async (email, name, otp) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EMAIL SKIP] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    await sendWithTimeout(
      transporter.sendMail({
        from: `"RS MANI Café" <${getSenderEmail()}>`,
        to: email,
        subject: 'Your OTP - RS MANI Café',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fdf6ec;border-radius:12px;">
            <h2 style="color:#c8501a;margin-bottom:8px;">RS MANI Café</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your one-time password (OTP) for account verification is:</p>
            <div style="font-size:36px;font-weight:bold;color:#c8501a;letter-spacing:8px;text-align:center;padding:16px 0;">${otp}</div>
            <p style="color:#666;font-size:13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          </div>
        `,
      })
    );

    console.log(`[EMAIL SENT] OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, error.message);
    console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
    return true;
  }
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EMAIL SKIP] Reset link for ${email}: ${resetLink}`);
    return true;
  }

  try {
    await sendWithTimeout(
      transporter.sendMail({
        from: `"RS MANI Café" <${getSenderEmail()}>`,
        to: email,
        subject: 'Password Reset - RS MANI Café',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fdf6ec;border-radius:12px;">
            <h2 style="color:#c8501a;">Password Reset</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#c8501a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
            <p style="color:#666;font-size:13px;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      })
    );

    console.log(`[EMAIL SENT] Reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}:`, error.message);
    console.log(`[EMAIL FALLBACK] Reset link for ${email}: ${resetLink}`);
    return true;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
};