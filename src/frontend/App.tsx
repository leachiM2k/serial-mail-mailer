import React, { useState } from 'react';
import { Steps, Typography } from "antd";
import Recipients from "./Recipients";
import Content from "./Content";
import Settings from "./Settings";
import Attachments from "./Attachments";
import Confirmation from "./Confirmation";

const steps = [
    {
        title: 'Recipients',
        content: Recipients,
    },
    {
        title: 'Content',
        content: Content,
    },
    {
        title: 'Attachments',
        content: Attachments,
    },
    {
        title: 'Settings',
        content: Settings,
    },
    {
        title: 'Confirmation & Send',
        isDisabled: (allValues: any) => !allValues.settings || !allValues.attachments || !allValues.content || !allValues.recipients,
    }
];
const App = () => {
    const [allValues, setAllValues] = useState({} as any);
    const [current, setCurrent] = useState(0);

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const items = steps
        .map((item) => ({
            key: item.title,
            title: item.title,
            disabled: item.isDisabled ? item.isDisabled(allValues) : false,
        }));

    const contentStyle: React.CSSProperties = {
        marginTop: 16,
    };

    const handleStepChange = (value: number) => {
        setCurrent(value);
    };

    const renderCurrentStep = () => {
        const C = steps[current].content;
        if(!C) return (<Confirmation
            recipients={allValues.recipients}
            subject={allValues.content?.subject}
            body={allValues.content?.body}
            htmlBody={allValues.content?.htmlBody}
            attachments={allValues.attachments}
            settings={allValues.settings}
        />);
        return <C {...allValues} onFinished={(values) => {
            setAllValues({...allValues, ...values});
            next();
        }}/>;
    }

    return (
        <div style={{padding: '0 24px'}}>

            <Typography.Title>Serien-Mailer</Typography.Title>

            <Steps current={current} items={items} onChange={handleStepChange}/>

            <div style={contentStyle}>{renderCurrentStep()}</div>

        </div>
    );
};

export default App;
