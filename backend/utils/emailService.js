const nodemailer = require('nodemailer');

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isEmailDisabled = () => {
  return process.env.EMAIL_SKIP === 'true' || process.env.SKIP_EMAIL === 'true';
};

const getFromEmail = () => {
  return (
    process.env.EMAIL_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    ''
  );
};

const getFromName = () => {
  return process.env.EMAIL_FROM_NAME || 'RS MANI Cafe';
};

const buildOTPHtml = (name, otp) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);">
    <div style="background:#c8501a;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;">RS MANI Cafe</h1>
    </div>
    <div style="background:#fdf6ec;padding:32px;">
      <h2 style="margin:0 0 16px;color:#c8501a;">Verify Your Account</h2>
      <p style="color:#333;">Hi <strong>${name || 'Customer'}</strong>,</p>
      <p style="color:#555;line-height:1.6;">Use this OTP to verify your RS MANI Cafe account:</p>
      <div style="font-size:34px;font-weight:bold;letter-spacing:8px;text-align:center;background:#fff;border:2px dashed #c8501a;color:#c8501a;border-radius:10px;padding:16px;margin:24px 0;">
        ${otp}
      </div>
      <p style="color:#777;font-size:13px;">Valid for 10 minutes. Do not share this OTP with anyone.</p>
    </div>
    <div style="background:#f0e0d0;padding:14px;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Do not reply to this email</p>
    </div>
  </div>
`;

let brevoClient = null;

const getBrevoClient = async () => {
  if (brevoClient) return brevoClient;

  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const { BrevoClient } = await import('@getbrevo/brevo');

  brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
    timeoutInSeconds: 30,
    maxRetries: 1,
  });

  return brevoClient;
};

const sendWithBrevo = async ({ email, name, subject, html, text }) => {
  const fromEmail = getFromEmail();

  if (!fromEmail) {
    throw new Error('EMAIL_FROM_EMAIL is missing');
  }

  const brevo = await getBrevoClient();

  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: getFromName(),
      email: fromEmail,
    },
    to: [
      {
        email,
        name: name || email,
      },
    ],
    subject,
    htmlContent: html,
    textContent: text,
  });

  console.log(`[EMAIL SENT] Brevo email sent to ${email}`);
  return result;
};

let gmailTransporter = null;

const getGmailTransporter = () => {
  if (gmailTransporter) return gmailTransporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is missing');
  }

  gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return gmailTransporter;
};

const sendWithGmail = async ({ email, subject, html, text }) => {
  const transporter = getGmailTransporter();

  const info = await transporter.sendMail({
    from: `"${getFromName()}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
    text,
  });

  console.log(`[EMAIL SENT] Gmail email sent to ${email} (${info.messageId})`);
  return info;
};

const sendMail = async ({ email, name, subject, html, text }) => {
  if (isEmailDisabled()) {
    throw new Error('Email sending disabled. Set EMAIL_SKIP=false and SKIP_EMAIL=false');
  }

  if (EMAIL_PROVIDER === 'brevo') {
    return sendWithBrevo({ email, name, subject, html, text });
  }

  if (EMAIL_PROVIDER === 'gmail' || EMAIL_PROVIDER === 'smtp') {
    return sendWithGmail({ email, name, subject, html, text });
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    if (isEmailDisabled()) {
      console.log(`\n-----------------------------------------`);
      console.log(`[DEVELOPMENT MODE - EMAIL DISABLED]`);
      console.log(`OTP generated for ${email}: ${otp}`);
      console.log(`-----------------------------------------\n`);
      return { success: true, sent: false };
    }

    await sendMail({
      email,
      name,
      subject: 'Your OTP - RS MANI Cafe',
      html: buildOTPHtml(name, otp),
      text: `Hi ${name || 'Customer'}, your RS MANI Cafe OTP is: ${otp}. Valid for 10 minutes.`,
    });

    return { success: true, sent: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  try {
    if (isEmailDisabled()) {
      console.log(`\n-----------------------------------------`);
      console.log(`[DEVELOPMENT MODE - EMAIL DISABLED]`);
      console.log(`Password reset link for ${email}: ${resetLink}`);
      console.log(`-----------------------------------------\n`);
      return { success: true, sent: false };
    }

    await sendMail({
      email,
      name,
      subject: 'Password Reset - RS MANI Cafe',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
          <h2>Password Reset - RS MANI Cafe</h2>
          <p>Hi ${name || 'Customer'},</p>
          <p>Click below to reset your password:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
      text: `Hi ${name || 'Customer'}, reset your password here: ${resetLink}`,
    });

    return { success: true, sent: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

const verifyEmailConnection = async () => {
  if (isEmailDisabled()) {
    console.warn('[emailService] Email disabled. Set EMAIL_SKIP=false and SKIP_EMAIL=false');
    return false;
  }

  try {
    if (EMAIL_PROVIDER === 'brevo') {
      if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY is missing');
      if (!getFromEmail()) throw new Error('EMAIL_FROM_EMAIL is missing');

      console.log('[emailService] Brevo API configured - emails will be delivered.');
      return true;
    }

    if (EMAIL_PROVIDER === 'gmail' || EMAIL_PROVIDER === 'smtp') {
      await getGmailTransporter().verify();
      console.log('[emailService] Gmail SMTP verified - emails will be delivered.');
      return true;
    }

    throw new Error(`Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
  } catch (err) {
    console.error(`[emailService] Email verification failed: ${err.message}`);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
  verifyEmailConnection,
};
