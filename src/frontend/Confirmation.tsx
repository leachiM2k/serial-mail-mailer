import { Button, Card, Checkbox, Col, InputNumber, List, Popconfirm, Progress, Result, Row, Slider, Statistic, Table, Tag, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import React, { useRef, useState } from "react";
import { RecipientType } from "./Recipients";
import { SettingsType } from "./Settings";
import { AttachmentIndividualType, AttachmentNoneType, AttachmentSharedType, ContentType, isAttachmentShared, isAttachmentNone } from "./ValuesProps";
import { MailMessageType } from "../shared/MailMessageType";
import { replaceTemplateStrings } from "../shared/replaceTemplateStrings";
import { useRecipients } from "../shared/useRecipients";

type Props = {
    recipients?: RecipientType[],
    attachments: AttachmentSharedType | AttachmentIndividualType | AttachmentNoneType,
    settings: SettingsType,
    content: ContentType,
    onSendingChange?: (sending: boolean) => void;
    onPrevious?: () => void;
    prevIcon?: React.ReactNode;
}

const extractFilename = (path: string): string => {
    return path.split(/[/\\]/).pop() || path;
}

type RecipientStatus = {
    recipient: RecipientType;
    status: 'pending' | 'sending' | 'success' | 'failed' | 'skipped';
    error?: string;
}

const Confirmation: React.FC<Props> = (props) => {
    const recipients = useRecipients(props.recipients);
    const [sending, setSending] = useState(false);
    const [sentCount, setSentCount] = useState(0);
    const [done, setDone] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [dryRun, setDryRun] = useState(false);
    const [sleepInterval, setSleepInterval] = useState(1000);
    const [statuses, setStatuses] = useState<RecipientStatus[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);

    const cancelRef = useRef(false);

    const buildAttachments = (attachments: AttachmentSharedType | AttachmentIndividualType | AttachmentNoneType, recipient: RecipientType) => {
        if (!attachments || isAttachmentNone(attachments)) {
            return [];
        }

        const attachmentPaths = isAttachmentShared(attachments) ?
            attachments.paths :
            (recipient[attachments.fieldname] || '').split(',').map((s: string) => s.trim()).filter(Boolean);

        return attachmentPaths.map((path: string) => ({
            filename: extractFilename(path),
            path
        }));
    }

    const buildMessage = (recipient: RecipientType): MailMessageType => {
        const from = `${props.settings.senderName} <${props.settings.senderAddress}>`;
        const to = `${recipient.firstname} ${recipient.lastname} <${recipient.email}>`;

        return {
            from,
            to,
            subject: props.content.subject,
            text: replaceTemplateStrings(props.content.body, recipient),
            html: replaceTemplateStrings(props.content.htmlBody, recipient),
            attachments: buildAttachments(props.attachments, recipient),
        };
    }

    const handleSendClick = async () => {
        setSending(true);
        setSentCount(0);
        setDone(false);
        setCancelled(false);
        cancelRef.current = false;
        props.onSendingChange?.(true);

        const initialStatuses: RecipientStatus[] = recipients.map(recipient => ({
            recipient,
            status: 'pending',
        }));
        setStatuses(initialStatuses);

        let processed = 0;
        const failed: RecipientStatus[] = [];

        for (let i = 0; i < recipients.length; i++) {
            if (cancelRef.current) {
                for (let j = i; j < recipients.length; j++) {
                    setStatuses(prev => prev.map((s, idx) =>
                        idx === j ? { ...s, status: 'skipped' } : s
                    ));
                }
                setCancelled(true);
                break;
            }

            const recipient = recipients[i];

            setStatuses(prev => prev.map((s, idx) =>
                idx === i ? { ...s, status: 'sending' } : s
            ));

            if (dryRun) {
                const message = buildMessage(recipient);
                console.log('[Dry run] Would send:', message);
            } else {
                const message = buildMessage(recipient);
                const response = await window.IpcService.send<{ success: boolean; error?: string }>('send-mail', {
                    params: { message },
                });

                if (response?.success) {
                    setStatuses(prev => prev.map((s, idx) =>
                        idx === i ? { ...s, status: 'success' } : s
                    ));
                } else {
                    const error = response?.error || 'Unknown error';
                    setStatuses(prev => prev.map((s, idx) =>
                        idx === i ? { ...s, status: 'failed', error } : s
                    ));
                    failed.push({ recipient, status: 'failed', error });
                }
            }

            processed++;
            setSentCount(processed);

            if (i < recipients.length - 1 && !cancelRef.current) {
                await new Promise((resolve) => setTimeout(resolve, sleepInterval));
            }
        }

        setSending(false);
        setDone(true);
        props.onSendingChange?.(false);
    }

    const handleCancel = () => {
        cancelRef.current = true;
    }

    const handleExportFailed = () => {
        const failedRecipients = statuses
            .filter(s => s.status === 'failed')
            .map(s => ({ ...s.recipient, error: s.error }));
        if (failedRecipients.length === 0) return;

        const csv = Papa.unparse(failedRecipients);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'failed-recipients.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    const renderSending = () => {
        if (!sending && !done) return null;
        const total = recipients.length || 1;
        const percent = Math.round(sentCount / total * 100);
        return (
            <>
                <Typography.Text type="secondary">
                    {sending ? (cancelled ? 'Cancelling...' : 'Sending...') : ''}
                    {done && `Processed ${sentCount} of ${recipients.length} mails`}
                </Typography.Text>
                <Progress
                    percent={percent}
                    status={sending ? 'active' : (cancelled ? 'exception' : 'success')}
                />
            </>
        );
    }

    const renderResult = () => {
        if (!done) return null;
        const successCount = statuses.filter(s => s.status === 'success').length;
        const failedCount = statuses.filter(s => s.status === 'failed').length;
        const skippedCount = statuses.filter(s => s.status === 'skipped').length;

        if (dryRun) {
            return <Result status="info" title={`Dry run complete - ${sentCount} mails would have been sent.`}/>;
        }

        if (cancelled) {
            return (
                <Result
                    status="warning"
                    title={`Sending cancelled - ${successCount} sent, ${skippedCount} skipped`}
                />
            );
        }

        if (failedCount > 0) {
            return (
                <>
                    <Result
                        status="warning"
                        title={`${successCount} of ${recipients.length} mails sent successfully`}
                        subTitle={`${failedCount} mail(s) failed`}
                    />
                    <Button type="default" onClick={handleExportFailed} style={{ marginBottom: 16 }}>
                        Export failed recipients as CSV
                    </Button>
                    <List
                        size="small"
                        bordered
                        dataSource={statuses.filter(s => s.status === 'failed')}
                        renderItem={(item) => (
                            <List.Item>
                                <Typography.Text type="danger">
                                    {item.recipient.firstname} {item.recipient.lastname} &lt;{item.recipient.email}&gt;: {item.error}
                                </Typography.Text>
                            </List.Item>
                        )}
                    />
                </>
            );
        }

        return <Result status="success" title={`All ${successCount} mails were sent successfully.`}/>;
    }

    const renderStatusTable = () => {
        if (statuses.length === 0) return null;

        const statusColors: Record<RecipientStatus['status'], string> = {
            pending: 'default',
            sending: 'processing',
            success: 'success',
            failed: 'error',
            skipped: 'warning',
        };

        const columns = [
            {
                title: 'Name',
                dataIndex: ['recipient', 'firstname'],
                key: 'firstname',
                render: (_: unknown, record: RecipientStatus) =>
                    `${record.recipient.firstname} ${record.recipient.lastname}`,
            },
            {
                title: 'E-Mail',
                dataIndex: ['recipient', 'email'],
                key: 'email',
            },
            {
                title: 'Status',
                key: 'status',
                render: (_: unknown, record: RecipientStatus) => (
                    <Tag color={statusColors[record.status]}>
                        {record.status}
                    </Tag>
                ),
            },
            {
                title: 'Error',
                key: 'error',
                render: (_: unknown, record: RecipientStatus) =>
                    record.error ? <Typography.Text type="danger">{record.error}</Typography.Text> : '-',
            },
        ];

        return (
            <Table
                dataSource={statuses}
                columns={columns}
                rowKey={(record) => record.recipient.email}
                pagination={false}
                size="small"
                style={{ marginTop: 16 }}
                scroll={{ y: 300 }}
            />
        );
    }

    const hasRecipients = recipients.length > 0;
    const failedCount = statuses.filter(s => s.status === 'failed').length;

    return (
        <>
            <Typography.Title level={4} className="app-section-title">Overview</Typography.Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" className="app-stat-card">
                        <Statistic title="Recipients" value={recipients.length}/>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" className="app-stat-card">
                        <Statistic
                            title="Attachments"
                            value={isAttachmentShared(props.attachments) ? props.attachments.paths.length
                                : isAttachmentNone(props.attachments) ? 'None'
                                : 'Per recipient'}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" className="app-stat-card">
                        <Statistic title="Sender" value={props.settings.senderAddress}/>
                    </Card>
                </Col>
            </Row>

            <Typography.Paragraph style={{ marginTop: 16 }}>
                <strong>Subject:</strong> {props.content.subject || <Typography.Text type="secondary">(no subject)</Typography.Text>}
            </Typography.Paragraph>

            {!isAttachmentNone(props.attachments) && !isAttachmentShared(props.attachments) && (
                <Typography.Paragraph type="secondary">
                    <strong>Individual attachment field:</strong> {props.attachments.fieldname}
                </Typography.Paragraph>
            )}

            {hasRecipients && (
                <>
                    <Typography.Title level={5} style={{ marginTop: 20 }}>Preview mail</Typography.Title>

                    <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: '30%' }}>
                            <Typography.Text>
                                {previewIndex + 1} / {recipients.length} - {recipients[previewIndex].firstname} {recipients[previewIndex].lastname} &lt;{recipients[previewIndex].email}&gt;
                            </Typography.Text>
                        </div>
                        <div style={{ width: '70%', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Button
                                icon={<LeftOutlined/>}
                                disabled={previewIndex === 0}
                                onClick={() => setPreviewIndex(prev => Math.max(0, prev - 1))}
                            />
                            <Button
                                icon={<RightOutlined/>}
                                disabled={previewIndex === recipients.length - 1}
                                onClick={() => setPreviewIndex(prev => Math.min(recipients.length - 1, prev + 1))}
                            />
                            <Slider
                                min={0}
                                max={recipients.length - 1}
                                value={previewIndex}
                                onChange={setPreviewIndex}
                                style={{ flex: 1 }}
                                tooltip={{ formatter: (v) => `${(v ?? 0) + 1} / ${recipients.length}` }}
                            />
                        </div>
                    </div>

                    <iframe srcDoc={replaceTemplateStrings(props.content.htmlBody, recipients[previewIndex])} style={{
                        width: '100%',
                        height: 400,
                        border: "1px solid var(--app-border)",
                        borderRadius: 12,
                        background: '#fff',
                    }}/>
                </>
            )}

            {!sending && !done && (
                <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <Typography.Text>Sleep between mails (ms): </Typography.Text>
                        <InputNumber
                            min={0}
                            max={60000}
                            step={500}
                            value={sleepInterval}
                            onChange={(v) => setSleepInterval(v ?? 1000)}
                            style={{ width: 120 }}
                        />
                    </div>
                    <Checkbox
                        checked={dryRun}
                        onChange={(e) => setDryRun(e.target.checked)}
                    >
                        Dry run (preview without sending)
                    </Checkbox>
                </div>
            )}

            {renderSending()}
            {renderResult()}
            {renderStatusTable()}

            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                {!sending && !done && props.onPrevious && (
                    <Button icon={props.prevIcon} onClick={props.onPrevious}>Previous</Button>
                )}
                {!sending && !done && (
                    <Popconfirm
                        title="Start sending?"
                        description={`Are you sure you want to start sending${dryRun ? ' (dry run)' : ''}?`}
                        onConfirm={() => handleSendClick()}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" disabled={!hasRecipients}>
                            {dryRun ? 'Dry run' : 'Send'}
                        </Button>
                    </Popconfirm>
                )}
                {sending && (
                    <Popconfirm
                        title="Cancel sending?"
                        description="Already sent mails cannot be undone."
                        onConfirm={() => handleCancel()}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="default" danger>Cancel</Button>
                    </Popconfirm>
                )}
                {done && failedCount > 0 && !dryRun && (
                    <Button type="default" onClick={handleExportFailed}>
                        Export failed recipients as CSV
                    </Button>
                )}
            </div>
        </>);
}

export default Confirmation;
