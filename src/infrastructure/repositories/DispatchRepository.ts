/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { IDispatchRepository } from "@/domain/repositories/IDispatchRepository";
import { createInvitationEmail } from "@/templates/email/invitation";

export class DispatchRepository implements IDispatchRepository {
    private transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'noufal.nexorian@gmail.com',
            pass: 'krwcmundtouqhfyn',
        },
    });

    async sendEmailNotification(
        email: string,
        subject: string,
        body: string
    ): Promise<boolean> {

        const invitation = createInvitationEmail({
            inviterName: "Noufal Rahim",
            inviterEmail: "noufalrahim6784@gmail.com",
            organizationName: "Oriental Corp",
            inviteeName: "John Doe",
            inviteeEmail: "noufalrahim6784@gmail.com",
            invitationId: "123",
            acceptUrl: `${process.env.NEXT_PUBLIC_BACKEND_API}/invites?type=accept-invite&workspaceId=693abf83eb17bfc757012c1d&email=noufalrahim6784@gmail.com&token=token@123`,
            rejectUrl: `${process.env.NEXT_PUBLIC_BACKEND_API}/invites?type=reject-invite&workspaceId=693abf83eb17bfc757012c1d&email=noufalrahim6784@gmail.com&token=token@123`,
        });

        try {
            await this.transporter.sendMail({
                from: `"Oriental Corp" <noufal.nexorian@gmail.com>`,
                to: invitation.to,
                subject: invitation.subject,
                text: invitation.text,
                html: invitation.html,
            });

            return true;
        } catch (err) {
            console.error("Email send failed:", err);
            return false;
        }
    }
}
