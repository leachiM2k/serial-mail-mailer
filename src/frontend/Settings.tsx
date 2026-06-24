import { Button, Divider, Form, Input, Radio, Typography } from "antd";
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
            <Typography.Title level={4} className="app-section-title">Settings</Typography.Title>

            <Form form={settingsForm} name="settings"
                  layout="vertical"
                  onChange={() => {
                      setTransport(settingsForm.getFieldValue('transport'));
                  }}
                  onFinish={handleFinishSettings}
                  initialValues={initialValues}
                  style={{ maxWidth: 640 }}
            >
                <Form.Item label="Transport" name="transport">
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button value="smtp">SMTP</Radio.Button>
                        <Radio.Button value="gmail">Google Mail / GMail</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Divider titlePlacement="left" plain>Sender</Divider>

                <Form.Item label="Sender name" name="senderName">
                    <Input placeholder="John Doe"/>
                </Form.Item>
                <Form.Item label="Sender e-mail address" name="senderAddress">
                    <Input placeholder="john@example.com"/>
                </Form.Item>

                {transport === 'gmail' && (
                    <>
                        <Divider titlePlacement="left" plain>GMail credentials</Divider>
                        <Form.Item label="GMail user" name="gmailUser">
                            <Input placeholder="you@gmail.com"/>
                        </Form.Item>
                        <Form.Item label="App-specific password" name="gmailPassword"
                                   tooltip="Use a Google app password, not your regular account password.">
                            <Input.Password placeholder="••••••••"/>
                        </Form.Item>
                    </>)}

                {transport === 'smtp' && (
                    <>
                        <Divider titlePlacement="left" plain>SMTP connection</Divider>
                        <Form.Item label="SMTP server" name="smtpServer">
                            <Input placeholder="smtp.example.com"/>
                        </Form.Item>
                        <Form.Item label="SMTP port" name="smtpPort">
                            <Input placeholder="587"/>
                        </Form.Item>
                        <Form.Item label="SMTP user" name="smtpUser">
                            <Input placeholder="username"/>
                        </Form.Item>
                        <Form.Item label="SMTP password" name="smtpPassword">
                            <Input.Password placeholder="••••••••"/>
                        </Form.Item>
                    </>)}
                <div style={{ display: 'flex', gap: 12 }}>
                    {props.onPrevious && <Button icon={props.prevIcon} onClick={props.onPrevious}>Previous</Button>}
                    <Button type="primary" icon={props.nextIcon} htmlType="submit">Save</Button>
                </div>
            </Form>
        </>);
}

export default Settings;
