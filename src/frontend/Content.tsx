import { Button, Col, Form, Input, Row, Tag, Typography } from "antd";
import React, { useRef } from "react";
import { Props } from "./SectionProps";
import { RecipientType } from "./Recipients";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import viewToPlainText from '@ckeditor/ckeditor5-clipboard/src/utils/viewtoplaintext';

const getJsonFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
}


type ContentProps = Props & {
    recipients: RecipientType[];
}

const Content: React.FC<Props> = (props: ContentProps) => {
    const [contentForm] = Form.useForm();
    const ckeditor = useRef<ClassicEditor>();
    const [availableTemplateVariables, setAvailableTemplateVariables] = React.useState<string[]>(
        Object.keys((props.recipients || [])[0])
    );

    const initialValues = getJsonFromLocalStorage('content');

    const handleFinishContent = (values: any) => {
        const plainText = viewToPlainText(ckeditor.current.editing.view.document.getRoot());
        const htmlBody = ckeditor.current.getData();

        values.body = plainText;
        values.htmlBody = htmlBody;

        localStorage.setItem('content', JSON.stringify(values));
        props.onFinished({content: values});
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
                    {availableTemplateVariables.map((variable, index) => <Tag key={index}>{variable}</Tag>)}
                </Form.Item>

                <Row justify={"end"}>
                    <Col span={8}>
                        Mail text:
                    </Col>
                    <Col span={16}>
                        <CKEditor
                            editor={ClassicEditor}
                            data={initialValues.htmlBody || ''}
                            onReady={editor => {
                                ckeditor.current = editor;
                            }}
                        />
                    </Col>
                </Row>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        </>);
}

export default Content;
