// utils/emailService.js — RS MANI Café
// Real Gmail delivery via Nodemailer + App Password
//
// Return shape (always an object, never throws):
//   { success: true,  sent: true }                         — email delivered
//   { success: true,  skipped: true }                      — EMAIL_SKIP=true (dev mode)
//   { success: true,  fallback: true }                     — env vars missing
//   { success: false, fallback: true, error: "..." }       — Gmail failed, OTP logged

const nodemailer = require('nodemailer');

// ── Transporter (built only when credentials exist) ───────────────────────────
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 16-char App Password, no spaces
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

// ── Startup SMTP check — call once after server boots ─────────────────────────
// Does NOT throw. Logs result clearly. Returns true/false.
const verifyEmailConnection = async () => {
  const skip =
    process.env.EMAIL_SKIP === 'true' || process.env.SKIP_EMAIL === 'true';
  if (skip) {
    console.log('[emailService] EMAIL_SKIP=true — SMTP verify skipped (dev mode).');
    return false;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      '\n[emailService] ⚠️  EMAIL_USER or EMAIL_PASS is missing.' +
      '\n  OTP emails will NOT reach users.' +
      '\n  → Add both vars in Render Dashboard → Environment\n'
    );
    return false;
  }

  try {
    await getTransporter().verify();
    console.log('[emailService] ✅ Gmail SMTP verified — emails will be delivered.');
    return true;
  } catch (err) {
    console.error(
      `\n[emailService] ❌ Gmail SMTP verify FAILED: ${err.message}` +
      '\n  Fix checklist:' +
      '\n  1. EMAIL_PASS must be an App Password, not your Gmail login password' +
      '\n     → myaccount.google.com/apppasswords' +
      '\n  2. 2-Step Verification must be ON first' +
      '\n     → myaccount.google.com/security' +
      '\n  3. EMAIL_PASS must have no spaces (paste 16 chars directly)' +
      '\n  4. EMAIL_USER must be the full Gmail address\n'
    );
    return false;
  }
};

// ── generateOTP ───────────────────────────────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── OTP email HTML ────────────────────────────────────────────────────────────
const buildOTPHtml = (name, otp) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
              border-radius:12px;overflow:hidden;
              box-shadow:0 4px 16px rgba(0,0,0,0.10);">
    <div style="background:#c8501a;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">☕ RS MANI Café</h1>
    </div>
    <div style="background:#fdf6ec;padding:32px;">
      <p style="margin:0 0 12px;color:#333;font-size:16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
        Your one-time password (OTP) for account verification is:
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <span style="display:inline-block;background:#fff;border:2px dashed #c8501a;
                     border-radius:10px;padding:16px 40px;font-size:38px;
                     font-weight:bold;color:#c8501a;letter-spacing:10px;">
          ${otp}
        </span>
      </div>
      <p style="margin:0 0 8px;color:#555;font-size:14px;">
        ⏱ Valid for <strong>10 minutes</strong>. Do not share this with anyone.
      </p>
      <p style="margin:0;color:#999;font-size:12px;">
        If you did not sign up at RS MANI Café, please ignore this email.
      </p>
    </div>
    <div style="background:#f0e0d0;padding:14px 32px;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">
        © ${new Date().getFullYear()} RS MANI Café · Do not reply to this email
      </p>
    </div>
  </div>
`;

// ── sendOTPEmail ──────────────────────────────────────────────────────────────
// Signature: sendOTPEmail(email, name, otp)
// Always returns an object — never throws — controller decides what to show user
//
// Return values:
//   { success: true,  sent: true }                    — Gmail delivered ✅
//   { success: true,  skipped: true }                 — EMAIL_SKIP=true (dev)
//   { success: true,  fallback: true }                — missing env vars
//   { success: false, fallback: true, error: string } — Gmail failed, OTP logged
//
const sendOTPEmail = async (email, name, otp) => {
  // ── Dev skip mode ────────────────────────────────────────────────────────
  if (process.env.EMAIL_SKIP === 'true' || process.env.SKIP_EMAIL === 'true') {
    console.log(`[EMAIL SKIP] OTP for ${email}: ${otp}`);
    return { success: true, skipped: true };
  }

  // ── Missing credentials ──────────────────────────────────────────────────
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[EMAIL SKIP] No credentials — OTP for ${email}: ${otp}`);
    return { success: true, fallback: true };
  }

  // ── Attempt real Gmail send ──────────────────────────────────────────────
  try {
    const info = await transporter.sendMail({
      from: `"RS MANI Café" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP – RS MANI Café',
      html: buildOTPHtml(name, otp),
      text: `Hi ${name},\n\nYour RS MANI Café OTP is: ${otp}\n\nValid for 10 minutes. Do not share it.\n\nRS MANI Café`,
    });

    console.log(`[EMAIL SENT] OTP sent to ${email} (${info.messageId})`);
    return { success: true, sent: true };

  } catch (err) {
    // Gmail failed — log OTP so team can still debug/test
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}: ${err.message}`);
    console.log(`[EMAIL FALLBACK] OTP for ${email}: ${otp}`);
    return { success: false, fallback: true, error: err.message };
  }
};

// ── sendPasswordResetEmail ────────────────────────────────────────────────────
// Signature kept: sendPasswordResetEmail(email, name, resetLink)
// Returns same shape as sendOTPEmail for consistency
//
const sendPasswordResetEmail = async (email, name, resetLink) => {
  if (process.env.EMAIL_SKIP === 'true' || process.env.SKIP_EMAIL === 'true') {
    console.log(`[EMAIL SKIP] Reset link for ${email}: ${resetLink}`);
    return { success: true, skipped: true };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL SKIP] No credentials — Reset link for ${email}: ${resetLink}`);
    return { success: true, fallback: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"RS MANI Café" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset – RS MANI Café',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                    border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 16px rgba(0,0,0,0.10);">
          <div style="background:#c8501a;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;">☕ RS MANI Café</h1>
          </div>
          <div style="background:#fdf6ec;padding:32px;">
            <h2 style="margin:0 0 16px;color:#c8501a;">Password Reset</h2>
            <p style="color:#333;">Hi <strong>${name}</strong>,</p>
            <p style="color:#555;line-height:1.6;">
              Click below to reset your password. This link expires in <strong>1 hour</strong>.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetLink}"
                 style="padding:14px 32px;background:#c8501a;color:#fff;
                        border-radius:8px;text-decoration:none;font-weight:bold;">
                Reset My Password
              </a>
            </div>
            <p style="color:#999;font-size:12px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
          <div style="background:#f0e0d0;padding:14px;text-align:center;">
            <p style="margin:0;color:#999;font-size:11px;">
              © ${new Date().getFullYear()} RS MANI Café · Do not reply
            </p>
          </div>
        </div>
      `,
      text: `Hi ${name},\n\nReset your password: ${resetLink}\n\nExpires in 1 hour.\n\nRS MANI Café`,
    });

    console.log(`[EMAIL SENT] Reset email sent to ${email} (${info.messageId})`);
    return { success: true, sent: true };

  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}: ${err.message}`);
    console.log(`[EMAIL FALLBACK] Reset link for ${email}: ${resetLink}`);
    return { success: false, fallback: true, error: err.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
  verifyEmailConnection,
};
