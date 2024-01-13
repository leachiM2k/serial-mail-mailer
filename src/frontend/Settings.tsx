import { Button, Form, Input, Radio, Typography } from "antd";
import React from "react";
import { Props } from "./SectionProps";

export type SettingsType = {
    transport: 'smtp' | 'gmail';
    gmailUser?: string;
    gmailPassword?: string;
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

    const initialValues = getJsonFromLocalStorage('settings');

    const [transport, setTransport] = React.useState<'smtp' | 'gmail'>(initialValues.transport || 'smtp');

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
                  onChange={() => {
                      setTransport(settingsForm.getFieldValue('transport'));
                  }}
                  onFinish={handleFinishSettings}
                  initialValues={initialValues}
            >
                <Form.Item label="Transport" name="transport">
                    <Radio.Group>
                        <Radio.Button value="smtp">SMTP</Radio.Button>
                        <Radio.Button value="gmail">Google Mail / GMail</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="Sendername" name="senderName">
                    <Input/>
                </Form.Item>
                <Form.Item label="Sender e-mail address" name="senderAddress">
                    <Input/>
                </Form.Item>

                {transport === 'gmail' && (
                    <>
                        <Form.Item label="GMail User" name="gmailUser">
                            <Input/>
                        </Form.Item>
                        <Form.Item label="App specific password" name="gmailPassword">
                            <Input type="password"/>
                        </Form.Item>
                    </>)}

                {transport === 'smtp' && (
                    <>
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
                    </>)}
                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
        </>);
}

export default Settings;
