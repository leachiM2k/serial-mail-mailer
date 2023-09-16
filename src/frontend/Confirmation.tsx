import { Button, Popconfirm, Progress, Result, Typography } from "antd";
import React, { useState } from "react";
import { RecipientType } from "./Recipients";
import { SettingsType } from "./Settings";

type Props = {
    recipients: RecipientType[];
    subject: string;
    body: string;
    attachments: string[];
    settings: SettingsType;
}

const Confirmation: React.FC<Props> = (props) => {

    const [sending, setSending] = useState(false);
    const [sentCount, setSentCount] = useState(0);

    const handleSendClick = async () => {
        setSending(true);
        setSentCount(0);

        const sendMail = async (recipient: RecipientType) => {
            const from = `${props.settings.senderName} <${props.settings.senderAddress}>`;
            const to = `${recipient.firstname} ${recipient.lastname} <${recipient.email}>`;
            const message = {
                from,
                to,

                // Subject of the message
                subject: props.subject,

                // plaintext body
                text: props.body.replace(/##firstname##/g, recipient.firstname),

                attachments: (props.attachments || []).map((attachment) => ({
                    filename: attachment.split('/').pop(),
                    path: attachment
                })),

            };

            const success = await window.IpcService.send<{ success: true }>('send-mail', {
                params: {
                    message,
                    settings: props.settings
                }
            });

            if(success) {
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
        if(!sending) return null;
        return (
            <>
                <Typography.Text type="secondary">Sending...</Typography.Text>
                <Progress percent={sentCount / props.recipients.length * 100} status="active" />
            </>
        );
    }

    return (
        <>
            <Typography.Title level={2}>Overview</Typography.Title>
            <Typography.Paragraph><strong>Recipients:</strong> {props.recipients.length}</Typography.Paragraph>
            <Typography.Paragraph><strong>Subject:</strong> {props.subject}</Typography.Paragraph>
            <Typography.Paragraph><strong>Attachments:</strong> {props.attachments.length}</Typography.Paragraph>

            {renderSending()}
            {sentCount === props.recipients.length && <Result status="success" title={`All ${sentCount} mails were sent successfully.`} />}
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
