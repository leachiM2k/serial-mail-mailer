import { RecipientType } from "./Recipients";
import { SettingsType } from "./Settings";

export type ValuesProps = {
    recipients?: RecipientType[];
    content?: ContentType;
    attachments?: AttachmentSharedType | AttachmentIndividualType;
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


export const isAttachmentShared = (obj: any): obj is AttachmentSharedType => {
    return obj && Array.isArray(obj.paths);
}
