import nodemailer from "nodemailer";

let cached: any | null = null;

export function getMailTransport() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) return null;

  if (cached) return cached;

  cached = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  return cached;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!from) return;
    const transport = getMailTransport();
    if (!transport) return;
    await transport.sendMail({ from, ...params });
  } catch (error: any) {
    if (error?.code === "EAUTH" || error?.responseCode === 535) {
      console.warn("Email notification skipped: Invalid SMTP credentials (535 Bad Credentials)");
    } else {
      console.error("Email send failed:", error?.message || error);
    }
  }
}
