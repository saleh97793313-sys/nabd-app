import nodemailer from "nodemailer";

const EMAIL_USER = process.env["EMAIL_USER"];
const EMAIL_PASS = process.env["EMAIL_PASS"];

const devMode = !EMAIL_USER || !EMAIL_PASS;

if (devMode) {
  console.warn("⚠️  EMAIL_USER / EMAIL_PASS not set — OTP will be logged to console only (dev mode).");
}

const transporter = devMode
  ? null
  : nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

export async function sendOtpEmail(to: string, code: string, name: string): Promise<void> {
  const subject = "رمز التحقق - Ocure أو كيور";
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
      <div style="background: #00C896; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 2px;">Ocure</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">أو كيور | منصة الولاء الصحي</p>
      </div>
      <div style="padding: 32px 24px; background: white;">
        <h2 style="color: #1A3A5C; margin: 0 0 8px;">مرحباً ${name} 👋</h2>
        <p style="color: #555; margin: 0 0 24px; line-height: 1.6;">
          شكراً لتسجيلك في Ocure. استخدم رمز التحقق أدناه لتفعيل حسابك:
        </p>
        <div style="background: #f0fdf8; border: 2px dashed #00C896; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
          <p style="margin: 0 0 8px; color: #666; font-size: 13px;">رمز التحقق</p>
          <h1 style="margin: 0; color: #00C896; font-size: 42px; letter-spacing: 8px; font-weight: bold;">${code}</h1>
          <p style="margin: 12px 0 0; color: #999; font-size: 12px;">صالح لمدة 10 دقائق فقط</p>
        </div>
        <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
          إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد.
        </p>
      </div>
      <div style="padding: 16px; background: #f0fdf8; text-align: center;">
        <p style="margin: 0; color: #aaa; font-size: 12px;">© 2026 Ocure أو كيور — جميع الحقوق محفوظة</p>
      </div>
    </div>
  `;

  if (devMode) {
    console.log(`\n📧 [DEV] OTP for ${to}: ${code}\n`);
    return;
  }

  await transporter!.sendMail({
    from: `"Ocure أو كيور" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
