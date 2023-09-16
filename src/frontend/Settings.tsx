import { Button, Form, Input, Typography } from "antd";
import React from "react";
import { Props } from "./SectionProps";

export type SettingsType = {
    senderName: string;
    senderAddress: string;
    smtpServer: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
}

const getJsonFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
}

const Settings: React.FC<Props> = (props: Props) => {
    const [settingsForm] = Form.useForm<SettingsType>();

    const handleFinishSettings = (values: SettingsType) => {
        localStorage.setItem('settings', JSON.stringify(values));
        props.onFinished({settings: values});
    }

    return (
        <>
            <Typography.Title level={2}>Settings</Typography.Title>
            <Form form={settingsForm} name="settings"
                  labelCol={{span: 8}}
                  wrapperCol={{span: 16}}
                  onFinish={handleFinishSettings}
                  initialValues={getJsonFromLocalStorage('settings')}
            >
                <Form.Item label="Sendername" name="senderName">
                    <Input/>
                </Form.Item>
                <Form.Item label="Sender e-mail address" name="senderAddress">
                    <Input/>
                </Form.Item>

                <Form.Item label="SMTP Server" name="smtpServer">
                    <Input/>
                </Form.Item>
                <Form.Item label="SMTP Port" name="smtpPort">
                    <Input/>
                </Form.Item>
                <Form.Item label="SMTP User" name="smtpUser">
                    <Input/>
                </Form.Item>
                <Form.Item label="SMTP Password" name="smtpPassword">
                    <Input type="password"/>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        </>);
}

export default Settings;
