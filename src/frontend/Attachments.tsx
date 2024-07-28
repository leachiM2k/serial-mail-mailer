import { Button, Form, Radio, RadioChangeEvent, Select, Typography, Upload, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { Props } from "./SectionProps";
import { RecipientType } from "./Recipients";
import { AttachmentIndividualType, AttachmentSharedType, isAttachmentShared } from "./ValuesProps";

const {Option} = Select;
const {Dragger} = Upload;

const getJsonFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
}

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

type AttachmentProps = Props & {
    recipients: RecipientType[];
}

const Attachments: React.FC<Props> = (props: AttachmentProps) => {
    const storedAttachments: AttachmentSharedType | AttachmentIndividualType = getJsonFromLocalStorage('attachments');

    const saveAttachments = (value: AttachmentSharedType | AttachmentIndividualType) => {
        localStorage.setItem('attachments', JSON.stringify(value));
    }

    const [attachmentType, setAttachmentType] = useState<'shared' | 'individual'>(isAttachmentShared(storedAttachments) ? 'shared' : 'individual');
    const [availableTemplateVariables] = React.useState<string[]>(
        Object.keys((props.recipients || [])[0])
    );

    const [fileList, setFileList] = React.useState<any[]>(isAttachmentShared(storedAttachments) ? storedAttachments.paths : []);
    const [form] = Form.useForm();

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        defaultFileList: fileList,
        beforeUpload: (file) => {
            const f = {
                uid: file.uid,
                name: file.name,
                path: file.path,
            };
            setFileList((prev) => {
                const newFileList = [...prev, f];
                saveAttachments({paths: newFileList});
                return newFileList;
            });
            return false;
        },
        onRemove: (file) => {
            const newFileList = fileList.filter(f => f.uid !== file.uid);
            saveAttachments({paths: newFileList});
            setFileList(newFileList);
            return true;
        }
    };

    const handleFinish = (values: { attachmentsField: string }) => {
        const attachments = {fieldname: values.attachmentsField};
        saveAttachments(attachments);
        props.onFinished({attachments});
    };

    return (
        <>
            <Typography.Title level={2}>Attachments</Typography.Title>

            <Typography.Paragraph>
                You can add attachments that will be shared across all recipients or add individual attachments for each
                recipient. Shared attachments will be included in every email sent, while individual attachments allow
                you to customize the attachments for each recipient. To add shared attachments, select the "Shared
                attachments" option and upload your files. To add individual attachments, select the "Individual
                attachments" option.
            </Typography.Paragraph>

            <Form.Item label="Attachment type">
                <Radio.Group onChange={(e: RadioChangeEvent) => setAttachmentType(e.target.value)}
                             value={attachmentType}>
                    <Radio.Button value="shared">Shared attachments</Radio.Button>
                    <Radio.Button value="individual">Individual attachments</Radio.Button>
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
                            initialValues={isAttachmentShared(storedAttachments) ? {} : {attachmentsField: storedAttachments.fieldname}}
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
                    </>

                </>)
            }
        </>);
}

export default Attachments;
