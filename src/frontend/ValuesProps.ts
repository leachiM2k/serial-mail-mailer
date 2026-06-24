import { RecipientType } from "./Recipients";
import { SettingsType } from "./Settings";

export type ValuesProps = {
    recipients?: RecipientType[];
    content?: ContentType;
    attachments?: AttachmentSharedType | AttachmentIndividualType | AttachmentNoneType;
    settings?: SettingsType;
}

export type ContentType = {
    subject: string;
    body: string;
    htmlBody: string;
}

export type AttachmentSharedType = {
    paths: string[];
}

export type AttachmentIndividualType = {
    fieldname: string;
}

export type AttachmentNoneType = {
    type: 'none';
}


export const isAttachmentShared = (obj: unknown): obj is AttachmentSharedType => {
    return !!obj && typeof obj === 'object' && Array.isArray((obj as Record<string, unknown>).paths);
}

export const isAttachmentNone = (obj: unknown): obj is AttachmentNoneType => {
    return !!obj && typeof obj === 'object' && (obj as Record<string, unknown>).type === 'none';
}
