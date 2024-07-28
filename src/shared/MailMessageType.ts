export type MailMessageType = {
    attachments: { path: string; filename: string }[];
    subject: string;
    from: string;
    html: string;
    to: string;
    text: string
};
