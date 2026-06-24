import { Button, Col, Form, Input, Row, Tag, Typography } from "antd";
import React from "react";
import { Props } from "./SectionProps";
import { RecipientType } from "./Recipients";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { htmlToPlainText } from "../shared/htmlToPlainText";
import { getJsonFromLocalStorage } from "../shared/storage";
import { useRecipients } from "../shared/useRecipients";
import Toolbar from "./Toolbar";

type ContentProps = Props & {
    recipients?: RecipientType[];
}

const Content: React.FC<ContentProps> = (props) => {
    const [contentForm] = Form.useForm();

    const recipients = useRecipients(props.recipients);

    const [availableTemplateVariables] = React.useState<string[]>(
        recipients.length > 0 ? Object.keys(recipients[0]) : []
    );

    const initialValues = getJsonFromLocalStorage<{ subject?: string; body?: string; htmlBody?: string }>('content');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                autolink: false,
                HTMLAttributes: {
                    style: 'cursor: text;',
                },
            }),
            TextStyle,
            Color,
            Highlight,
        ],
        content: initialValues?.htmlBody || '',
        immediatelyRender: false,
    });

    const insertTemplateVariable = (variable: string) => {
        if (!editor) return;
        editor.chain().focus().insertContent(`##${variable}##`).run();
    };

    const handleFinishContent = (values: { subject?: string }) => {
        if (!editor) return;
        const htmlBody = editor.getHTML();
        const plainText = htmlToPlainText(htmlBody);

        const content = {
            subject: values.subject || '',
            body: plainText,
            htmlBody,
        };

        localStorage.setItem('content', JSON.stringify(content));
        props.onFinished({content});
    };

    return (
        <>
            <Typography.Title level={2}>Content</Typography.Title>

            <Form form={contentForm}
                  labelCol={{span: 8}}
                  wrapperCol={{span: 16}}
                  onFinish={handleFinishContent}
                  initialValues={initialValues}
            >
                <Form.Item label="Subject" name="subject">
                    <Input/>
                </Form.Item>

                <Form.Item label="Available template variables">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {availableTemplateVariables.map((variable) => (
                            <Tag
                                key={variable}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => insertTemplateVariable(variable)}
                            >
                                {variable}
                            </Tag>
                        ))}
                    </div>
                </Form.Item>

                <Row justify={"end"}>
                    <Col span={8}>
                        Mail text:
                    </Col>
                    <Col span={16}>
                        <Toolbar editor={editor}/>
                        <div
                            style={{
                                border: "1px solid #d9d9d9",
                                borderRadius: 6,
                                padding: 12,
                                minHeight: 300,
                            }}
                        >
                            <EditorContent editor={editor}/>
                        </div>
                    </Col>
                </Row>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        </>);
}

export default Content;
