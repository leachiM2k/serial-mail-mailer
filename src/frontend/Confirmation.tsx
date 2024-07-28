import { Button, Popconfirm, Progress, Result, Typography } from "antd";
import React, { useState } from "react";
import { RecipientType } from "./Recipients";
import { SettingsType } from "./Settings";
import { AttachmentIndividualType, AttachmentSharedType, ContentType, isAttachmentShared } from "./ValuesProps";
import { MailMessageType } from "../shared/MailMessageType";

type Props = {
    recipients: RecipientType[],
    attachments: AttachmentSharedType | AttachmentIndividualType,
    settings: SettingsType,
    content?: ContentType
}

const replaceTemplateStrings = (text: string, variables: { [key: string]: string }) => {
    let newText = text;
    for (const key in variables) {
        newText = newText.replace(new RegExp(`##${key}##`, 'g'), variables[key]);
    }
    return newText;
}

const Confirmation: React.FC<Props> = (props) => {

    const [sending, setSending] = useState(false);
    const [sentCount, setSentCount] = useState(0);

    const buildAttachments = (attachments: AttachmentSharedType | AttachmentIndividualType, recipient: RecipientType) => {
        if (!attachments) {
            return [];
        }

        const attachmentPaths = isAttachmentShared(attachments) ?
            attachments.paths :
            recipient[attachments.fieldname].split(',');

        return attachmentPaths.map((path) => ({
            filename: path.split('/').pop(),
            path
        }));
    }

    const handleSendClick = async () => {
        setSending(true);
        setSentCount(0);

        const sendMail = async (recipient: RecipientType) => {
            const from = `${props.settings.senderName} <${props.settings.senderAddress}>`;
            const to = `${recipient.firstname} ${recipient.lastname} <${recipient.email}>`;

            const message: MailMessageType = {
                from,
                to,

                // Subject of the message
                subject: props.content.subject,

                // plaintext body
                text: replaceTemplateStrings(props.content.body, recipient),
                html: replaceTemplateStrings(props.content.htmlBody, recipient),

                attachments: buildAttachments(props.attachments, recipient),

            };

            const success = await window.IpcService.send<{ success: true }>('send-mail', {
                params: {
                    message,
                    settings: props.settings
                }
            });

            // sleep for 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (success) {
                console.log('Message to ' + to + ' sent successfully!');
            } else {
                console.error('Message to ' + to + ' failed!');
            }
            setSentCount((prev) => prev + 1);
        }


        for (const recipient of props.recipients) {
            await sendMail(recipient);
        }

        setSending(false);
    }

    const renderSending = () => {
        if (!sending) return null;
        return (
            <>
                <Typography.Text type="secondary">Sending...</Typography.Text>
                <Progress percent={sentCount / props.recipients.length * 100} status="active"/>
            </>
        );
    }

    return (
        <>
            <Typography.Title level={2}>Overview</Typography.Title>
            <Typography.Paragraph><strong>Recipients:</strong> {props.recipients.length}</Typography.Paragraph>
            <Typography.Paragraph><strong>Subject:</strong> {props.content.subject}</Typography.Paragraph>

            {isAttachmentShared(props.attachments) ?
                <Typography.Paragraph><strong>Shared attachments:</strong> {props.attachments.paths.length}
                </Typography.Paragraph>
                :
                <Typography.Paragraph><strong>Individual attachment field name:</strong> {props.attachments.fieldname}
                </Typography.Paragraph>
            }

            <Typography.Paragraph><strong>Example mail:</strong></Typography.Paragraph>

            <iframe srcDoc={replaceTemplateStrings(props.content.htmlBody, props.recipients[0])} style={{
                width: '100%',
                height: 400,
                border: "1px solid black"
            }}/>

            {renderSending()}
            {sentCount === props.recipients.length &&
                <Result status="success" title={`All ${sentCount} mails were sent successfully.`}/>}
            <Popconfirm
                title="Start sending?"
                description="Are you sure you want to start sending?"
                onConfirm={() => handleSendClick()}
                okText="Yes"
                cancelText="No"
            >
                <Button type="primary" disabled={sending}>Send</Button>
            </Popconfirm>
        </>);
}

export default Confirmation;
