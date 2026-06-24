import { Button, Form, Input, Tag, Typography } from "antd";
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
            <Typography.Title level={4} className="app-section-title">Content</Typography.Title>

            <Form form={contentForm}
                  layout="vertical"
                  onFinish={handleFinishContent}
                  initialValues={initialValues}
            >
                <Form.Item label="Subject" name="subject">
                    <Input placeholder="Mail subject - use ##firstname## for template variables"/>
                </Form.Item>

                {availableTemplateVariables.length > 0 && (
                    <Form.Item label="Available template variables">
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                            Click a tag to insert it at the cursor position.
                        </Typography.Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {availableTemplateVariables.map((variable) => (
                                <Tag
                                    key={variable}
                                    color="blue"
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => insertTemplateVariable(variable)}
                                >
                                    {variable}
                                </Tag>
                            ))}
                        </div>
                    </Form.Item>
                )}

                <Form.Item label="Mail text">
                    <Toolbar editor={editor}/>
                    <div className="editor-surface" style={{ padding: 12, minHeight: 300, marginTop: 8 }}>
                        <EditorContent editor={editor}/>
                    </div>
                </Form.Item>

                <div style={{ display: 'flex', gap: 12 }}>
                    {props.onPrevious && <Button icon={props.prevIcon} onClick={props.onPrevious}>Previous</Button>}
                    <Button type="primary" icon={props.nextIcon} htmlType="submit">Save &amp; continue</Button>
                </div>
            </Form>
        </>);
}

export default Content;
