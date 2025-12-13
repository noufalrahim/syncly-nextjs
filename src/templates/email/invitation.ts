export type InvitationOptions = {
  inviterName: string;
  inviterEmail?: string;
  organizationName: string;
  inviteeName?: string;
  inviteeEmail: string;
  invitationId: string;
  acceptUrl: string;
  rejectUrl: string;
  expiresAt?: string;
  customMessage?: string;
  supportEmail?: string;
  logoUrl?: string;
};

export function createInvitationEmail(options: InvitationOptions) {
  const {
    inviterName,
    inviterEmail,
    organizationName,
    inviteeName,
    inviteeEmail,
    invitationId,
    acceptUrl,
    rejectUrl,
    expiresAt,
    customMessage,
    supportEmail = 'support@' + organizationName.replace(/\s+/g, '').toLowerCase() + '.com',
    logoUrl,
  } = options;

  const subject = `${inviterName} invited you to join ${organizationName}`;

  const text = [
    `Hi ${inviteeName ?? 'there'},`,
    ``,
    `${inviterName} (${inviterEmail ?? 'no-reply'}) has invited you to join the organization "${organizationName}".`,
    ``,
    customMessage ? `${customMessage}` : `If you accept, you will become a member of ${organizationName} with the permissions assigned by the inviter.`,
    ``,
    `Accept invitation: ${acceptUrl}`,
    `Reject invitation: ${rejectUrl}`,
    expiresAt ? `This invitation expires on: ${expiresAt}` : '',
    ``,
    `If you didn't expect this invitation or have questions, contact ${supportEmail}.`,
    ``,
    `Invitation ID: ${invitationId}`,
    ``,
    `Thanks,`,
    `${organizationName} Team`
  ].filter(Boolean).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Invitation to join ${organizationName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(16,24,40,0.08)">
      <tr>
        <td style="padding:24px 32px;border-bottom:1px solid #eef2f6;display:flex;align-items:center;gap:16px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="${organizationName} logo" style="height:40px;width:auto;border-radius:6px;">` : ''}
          <div>
            <div style="font-size:16px;font-weight:600;color:#0f172a">${organizationName}</div>
            <div style="font-size:12px;color:#64748b">${inviterName} invited ${inviteeEmail}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a">You're invited to join ${organizationName}</h1>
          <p style="margin:0 0 18px;color:#374151">Hi ${inviteeName ?? 'there'},</p>
          <p style="margin:0 0 18px;color:#374151">${inviterName} has invited you to join <strong>${organizationName}</strong>.</p>
          ${customMessage ? `<p style="margin:0 0 18px;color:#374151">${customMessage}</p>` : ''}
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:18px 0;">
            <tr>
              <td>
                <a href="${acceptUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;background:#2563eb;color:#ffffff">Accept invitation</a>
              </td>
              <td style="width:12px"></td>
              <td>
                <a href="${rejectUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none;border:1px solid #e6eef8;background:#ffffff;color:#0f172a">Reject</a>
              </td>
            </tr>
          </table>
          ${expiresAt ? `<p style="margin:12px 0 0;color:#6b7280;font-size:13px">This invitation expires on ${expiresAt}.</p>` : ''}
          <hr style="border:none;border-top:1px solid #eef2f6;margin:22px 0;">
          <p style="margin:0;color:#475569;font-size:13px">If you didn't expect this invitation or have questions, contact <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none">${supportEmail}</a>.</p>
          <p style="margin:12px 0 0;color:#9aa3b2;font-size:12px">Invitation ID: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;border:1px solid #e6eef8">${invitationId}</code></p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px;background:#fbfdff;text-align:center;color:#9aa3b2;font-size:12px">
          © ${new Date().getFullYear()} ${organizationName}. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    to: inviteeEmail,
    subject,
    text,
    html,
    meta: {
      invitationId,
      expiresAt: expiresAt ?? null
    }
  };
}
