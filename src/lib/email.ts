import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const APP_NAME = "The Lightning Doctor LLC Employee Portal";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${APP_NAME} — Password Reset`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">${APP_NAME}</h2>
        <p>You requested a password reset. Click the link below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}"
             style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
        <p style="color:#6b7280;font-size:13px;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}
