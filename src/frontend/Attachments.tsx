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
            <Typography.Title level={2}>Attachments</Typography.Title>

            <Typography.Paragraph>
                You can add attachments that will be shared across all recipients, add individual attachments for each
                recipient, or skip attachments entirely.
            </Typography.Paragraph>

            <Form.Item label="Attachment type">
                <Radio.Group onChange={(e: RadioChangeEvent) => setAttachmentType(e.target.value)}
                             value={attachmentType}>
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
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibited from uploading company data or
                            other
                            banned files.
                        </p>
                    </Dragger>

                    <Button type="primary" style={{marginTop: 16}}
                            onClick={() => props.onFinished({attachments: {paths: fileList.map(file => file.path)}})}>Next</Button>
                </>)
            }

            {attachmentType === 'individual' && (
                <>
                    <Typography.Paragraph>
                        It is possible to add individual attachment for each recipient.
                        Please select the field of your data source, that specify that path or URL of the attachments
                        to be added.
                    </Typography.Paragraph>
                    <Typography.Paragraph strong={true}>
                        Attention: Multiple are attachments must be separated by a comma. Therefore a comma is not allowed in the path or URL.
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

                        <Button type="primary" style={{marginTop: 16}} htmlType="submit">Next</Button>

                    </Form>
                </>)
            }

            {attachmentType === 'none' && (
                <>
                    <Typography.Paragraph>
                        No attachments will be added to the emails.
                    </Typography.Paragraph>
                    <Button type="primary" style={{marginTop: 16}} onClick={handleNone}>Next</Button>
                </>)
            }
        </>);
}

export default Attachments;
