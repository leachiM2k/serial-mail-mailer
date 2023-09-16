import { Button, Form, Input, Typography } from "antd";
import React from "react";
import { Props } from "./SectionProps";

const getJsonFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
}

const Content: React.FC<Props> = (props: Props) => {
    const [contentForm] = Form.useForm();

    const handleFinishContent = (values:any) => {
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
                  initialValues={getJsonFromLocalStorage('content')}
            >
                <Form.Item label="Subject" name="subject">
                    <Input/>
                </Form.Item>
                <Form.Item label="Body" name="body">
                    <Input.TextArea
                        rows={20}
                        autoSize={true}
                    />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        </>);
}

export default Content;
