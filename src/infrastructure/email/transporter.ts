import nodemailer from "nodemailer";

let cached: any | null = null;

export function getMailTransport() {
  if (cached) return cached;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error("Missing SMTP credentials: set SMTP_USER and SMTP_PASS");
  }

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
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing SMTP_FROM/SMTP_USER");
  const transport = getMailTransport();
  await transport.sendMail({ from, ...params });
}
