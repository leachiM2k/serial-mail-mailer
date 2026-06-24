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

const Settings: React.FC<Props> = (props: Props) => {
    const [settingsForm] = Form.useForm<SettingsType>();
    const [loading, setLoading] = React.useState(true);
    const [initialValues, setInitialValues] = React.useState<SettingsType | undefined>(undefined);

    React.useEffect(() => {
        const loadSettings = async () => {
            const response = await window.IpcService.send<{ success: boolean; settings?: SettingsType }>(
                'settings-storage',
                { params: { action: 'load' } }
            );
            if (response?.success && response.settings) {
                setInitialValues(response.settings);
                settingsForm.setFieldsValue(response.settings);
                setTransport(response.settings.transport || 'smtp');
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    const [transport, setTransport] = React.useState<'smtp' | 'gmail'>(initialValues?.transport || 'smtp');

    const handleFinishSettings = async (values: SettingsType) => {
        const response = await window.IpcService.send<{ success: boolean }>('settings-storage', {
            params: { action: 'save', settings: values }
        });
        if (response?.success) {
            props.onFinished({settings: values});
        }
    }

    if (loading) {
        return <Typography.Text>Loading settings...</Typography.Text>;
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
