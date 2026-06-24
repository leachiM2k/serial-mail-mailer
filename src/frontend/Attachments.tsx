import { Button, Form, Radio, RadioChangeEvent, Select, Typography, Upload, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { Props } from "./SectionProps";
import { RecipientType } from "./Recipients";
import { AttachmentIndividualType, AttachmentNoneType, AttachmentSharedType, isAttachmentShared } from "./ValuesProps";
import { getJsonFromLocalStorage } from "../shared/storage";
import { useRecipients } from "../shared/useRecipients";

const {Option} = Select;
const {Dragger} = Upload;

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

type AttachmentProps = Props & {
    recipients?: RecipientType[];
}

type AttachmentType = 'shared' | 'individual' | 'none';

const detectStoredType = (storedAttachments: unknown): AttachmentType => {
    if (!storedAttachments || typeof storedAttachments !== 'object') return 'none';
    if (Array.isArray((storedAttachments as Record<string, unknown>).paths)) return 'shared';
    if ('fieldname' in (storedAttachments as Record<string, unknown>)) return 'individual';
    return 'none';
}

const Attachments: React.FC<AttachmentProps> = (props) => {
    const storedAttachments = getJsonFromLocalStorage<AttachmentSharedType | AttachmentIndividualType | AttachmentNoneType>('attachments');

    const saveAttachments = (value: AttachmentSharedType | AttachmentIndividualType | AttachmentNoneType) => {
        localStorage.setItem('attachments', JSON.stringify(value));
    }

    const [attachmentType, setAttachmentType] = useState<AttachmentType>(detectStoredType(storedAttachments));
    const recipients = useRecipients(props.recipients);
    const [availableTemplateVariables] = React.useState<string[]>(
        recipients.length > 0 ? Object.keys(recipients[0]) : []
    );

    const [fileList, setFileList] = React.useState<{ uid: string; name: string; path: string }[]>(
        isAttachmentShared(storedAttachments)
            ? storedAttachments.paths.map(p => ({ uid: p, name: p.split(/[/\\]/).pop() || p, path: p }))
            : []
    );
    const [form] = Form.useForm();

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        defaultFileList: fileList,
        beforeUpload: (file) => {
            const filePath = (file as unknown as File & { path: string }).path;
            const f = {
                uid: file.uid,
                name: file.name,
                path: filePath,
            };
            setFileList((prev) => {
                const newFileList = [...prev, f];
                saveAttachments({paths: newFileList.map(file => file.path)});
                return newFileList;
            });
            return false;
        },
        onRemove: (file) => {
            const newFileList = fileList.filter(f => f.uid !== file.uid);
            saveAttachments({paths: newFileList.map(file => file.path)});
            setFileList(newFileList);
            return true;
        }
    };

    const handleFinish = (values: { attachmentsField: string }) => {
        const attachments = {fieldname: values.attachmentsField};
        saveAttachments(attachments);
        props.onFinished({attachments});
    };

    const handleNone = () => {
        const attachments: AttachmentNoneType = { type: 'none' };
        saveAttachments(attachments);
        props.onFinished({attachments});
    };

    return (
        <>
            <Typography.Title level={4} className="app-section-title">Attachments</Typography.Title>

            <Typography.Paragraph type="secondary">
                You can add attachments shared across all recipients, attach individual files per recipient (via a CSV
                field), or skip attachments entirely.
            </Typography.Paragraph>

            <Form.Item label="Attachment type">
                <Radio.Group
                    buttonStyle="solid"
                    onChange={(e: RadioChangeEvent) => setAttachmentType(e.target.value)}
                    value={attachmentType}
                >
                    <Radio.Button value="shared">Shared attachments</Radio.Button>
                    <Radio.Button value="individual">Individual attachments</Radio.Button>
                    <Radio.Button value="none">No attachments</Radio.Button>
                </Radio.Group>
            </Form.Item>

            {attachmentType === 'shared' && (
                <>
                    <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">Click or drag files to this area</p>
                        <p className="ant-upload-hint">
                            Supports multiple files. All files will be attached to every recipient.
                        </p>
                    </Dragger>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        {props.onPrevious && <Button icon={props.prevIcon} onClick={props.onPrevious}>Previous</Button>}
                        <Button type="primary" icon={props.nextIcon}
                                onClick={() => props.onFinished({attachments: {paths: fileList.map(file => file.path)}})}>Next</Button>
                    </div>
                </>)
            }

            {attachmentType === 'individual' && (
                <>
                    <Typography.Paragraph>
                        Add an individual attachment for each recipient. Select the field from your data source that
                        contains the file path or URL of the attachment.
                    </Typography.Paragraph>
                    <Typography.Paragraph type="warning">
                        <strong>Attention:</strong> multiple attachments must be separated by a comma, so commas are not
                        allowed within a path or URL.
                    </Typography.Paragraph>
                    <Form
                        {...layout}
                        form={form}
                        name="connection"
                        initialValues={isAttachmentShared(storedAttachments) || !storedAttachments ? {} : {attachmentsField: (storedAttachments as AttachmentIndividualType).fieldname}}
                        style={{maxWidth: 600}}
                        onFinish={handleFinish}
                    >
                        <Form.Item label="Attachments" name="attachmentsField">
                            <Select
                                placeholder="Field in your data source for the attachments"
                                allowClear
                            >
                                {availableTemplateVariables.map((field: string) => (
                                    <Option value={field} key={field}>{field}</Option>))}
                            </Select>
                        </Form.Item>

                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            {props.onPrevious && <Button icon={props.prevIcon} onClick={props.onPrevious}>Previous</Button>}
                            <Button type="primary" icon={props.nextIcon} htmlType="submit">Next</Button>
                        </div>

                    </Form>
                </>)
            }

            {attachmentType === 'none' && (
                <>
                    <Typography.Paragraph type="secondary">
                        No attachments will be added to the emails.
                    </Typography.Paragraph>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        {props.onPrevious && <Button icon={props.prevIcon} onClick={props.onPrevious}>Previous</Button>}
                        <Button type="primary" icon={props.nextIcon} onClick={handleNone}>Next</Button>
                    </div>
                </>)
            }
        </>);
}

export default Attachments;
