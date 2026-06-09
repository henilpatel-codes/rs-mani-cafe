// utils/emailService.js — OTP and password reset emails with safe fallback
const nodemailer = require('nodemailer');
const isTrue = (value) => String(value).toLowerCase() === 'true';

const shouldSkipEmail = () => {
  return (
    isTrue(process.env.EMAIL_SKIP) ||
    isTrue(process.env.SKIP_EMAIL) ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_USER === 'your_gmail@gmail.com' ||
    process.env.EMAIL_PASS === 'your_gmail_app_password_16chars'
  );
};

const getTransporter = () => {
  if (shouldSkipEmail()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'false' ? false : true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    // Important for Render: don't hang forever
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`[EMAIL SKIP] OTP for ${email}: ${otp}`);
      return { success: true, skipped: true };
    }

    await transporter.sendMail({
      from: `"RS MANI Café" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP - RS MANI Café',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fdf6ec;border-radius:12px;">
          <h2 style="color:#c8501a;margin-bottom:8px;">RS MANI Café</h2>
          <p>Hi <strong>${name || 'Customer'}</strong>,</p>
          <p>Your one-time password (OTP) for account verification is:</p>
          <div style="font-size:36px;font-weight:bold;color:#c8501a;letter-spacing:8px;text-align:center;padding:16px 0;">${otp}</div>
          <p style="color:#666;font-size:13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>`,
    });

    console.log(`[EMAIL SENT] OTP email delivered to ${email}`);
    return { success: true, skipped: false };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}: ${err.message}`);
    console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);

    // Important: never throw, otherwise signup becomes 500
    return { success: false, skipped: false, error: err.message };
  }
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`[EMAIL SKIP] Reset link for ${email}: ${resetLink}`);
      return { success: true, skipped: true };
    }

    await transporter.sendMail({
      from: `"RS MANI Café" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - RS MANI Café',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fdf6ec;border-radius:12px;">
          <h2 style="color:#c8501a;">Password Reset</h2>
          <p>Hi <strong>${name || 'Customer'}</strong>,</p>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#c8501a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
          <p style="color:#666;font-size:13px;">If you did not request this, please ignore this email.</p>
        </div>`,
    });

    console.log(`[EMAIL SENT] Password reset email delivered to ${email}`);
    return { success: true, skipped: false };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}: ${err.message}`);
    console.log(`[EMAIL FALLBACK] Reset link for ${email}: ${resetLink}`);

    // Important: never throw
    return { success: false, skipped: false, error: err.message };
  }
};

module.exports = { generateOTP, sendOTPEmail, sendPasswordResetEmail };