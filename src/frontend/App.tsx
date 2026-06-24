import React, { useState } from 'react';
import { App as AntdApp, Card, ConfigProvider, Steps, Typography } from "antd";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined,
    MailOutlined,
    PaperClipOutlined,
    SettingOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import Recipients from "./Recipients";
import Content from "./Content";
import Settings from "./Settings";
import Attachments from "./Attachments";
import Confirmation from "./Confirmation";
import { ValuesProps } from "./ValuesProps";
import { darkTheme, lightTheme, useSystemDarkMode } from "./theme";

type StepDef = {
    title: string;
    icon: React.ReactNode;
    content?: React.FC<{ onFinished: (values?: ValuesProps) => void } & Record<string, unknown>>;
    isDisabled?: (allValues: ValuesProps) => boolean;
};

const steps: StepDef[] = [
    {
        title: 'Recipients',
        icon: <TeamOutlined/>,
        content: Recipients,
    },
    {
        title: 'Content',
        icon: <MailOutlined/>,
        content: Content,
    },
    {
        title: 'Attachments',
        icon: <PaperClipOutlined/>,
        content: Attachments,
    },
    {
        title: 'Settings',
        icon: <SettingOutlined/>,
        content: Settings,
    },
    {
        title: 'Confirmation',
        icon: <CheckCircleOutlined/>,
        isDisabled: (allValues: ValuesProps) => !allValues.settings || !allValues.attachments || !allValues.content || !allValues.recipients,
    },
];

const App = () => {
    const isDark = useSystemDarkMode();
    const [allValues, setAllValues] = useState<ValuesProps>({});
    const [current, setCurrent] = useState(0);
    const [sending, setSending] = useState(false);

    const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
    const prev = () => setCurrent((c) => Math.max(c - 1, 0));
    const prevIcon = <ArrowLeftOutlined/>;
    const nextIcon = <ArrowRightOutlined/>;

    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
        icon: item.icon,
        disabled: item.isDisabled ? item.isDisabled(allValues) : false,
    }));

    const handleStepChange = (value: number) => {
        if (sending) return;
        setCurrent(value);
    };

    const renderCurrentStep = () => {
        const C = steps[current].content;
        const goPrev = current > 0 && !sending ? prev : undefined;
        if (!C) return (
            <Confirmation
                recipients={allValues.recipients}
                content={allValues.content!}
                attachments={allValues.attachments!}
                settings={allValues.settings!}
                onSendingChange={setSending}
                onPrevious={goPrev}
                prevIcon={prevIcon}
            />
        );
        return <C {...allValues} onPrevious={goPrev} prevIcon={prevIcon} nextIcon={nextIcon} onFinished={(values) => {
            setAllValues({...allValues, ...values});
            next();
        }}/>;
    };

    return (
        <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
            <AntdApp>
                <div className="app-sticky">
                    <div className="app-sticky-inner">
                        <header className="app-header">
                            <div className="app-brand">
                                <div className="app-brand-icon"><MailOutlined/></div>
                                <div>
                                    <Typography.Title level={3} className="app-brand-title">Serien-Mailer</Typography.Title>
                                    <p className="app-brand-subtitle">Send templated mass emails with attachments</p>
                                </div>
                            </div>
                        </header>

                        <Steps
                            className="app-steps-small"
                            size="small"
                            current={current}
                            items={items}
                            onChange={handleStepChange}
                        />
                    </div>
                </div>

                <div className="app-shell">
                    <Card variant="borderless">
                        {renderCurrentStep()}
                    </Card>
                </div>
            </AntdApp>
        </ConfigProvider>
    );
};

export default App;
