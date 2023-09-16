import React, { useState } from "react";
import { Button, Form, Input, Table, Typography } from "antd";
import Papa, { ParseResult } from "papaparse";
import { Props } from "./SectionProps";

export type RecipientType = {
    [key: string]: string;
}

const getJsonFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
}

const Recipients: React.FC<Props> = (props: Props) => {
    const [recipientsForm] = Form.useForm();

    const [dataSource, setDataSource] = useState<RecipientType[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const handleFinishRecipients = (values: any) => {
        localStorage.setItem('recipients', JSON.stringify(values));
        parseRecipients(values.recipients);
    }

    const parseRecipients = (csvData: string) => {
        const recipientParseResult: ParseResult<RecipientType> = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
        });
        if (recipientParseResult.data.length > 0) {
            setColumns(Object.keys(recipientParseResult.data[0]));
            setDataSource(recipientParseResult.data);
        }
    }

    return (<>
        <Typography.Title level={2}>Recipients</Typography.Title>
        <Form form={recipientsForm} onFinish={handleFinishRecipients}
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
              initialValues={getJsonFromLocalStorage("recipients")}
        >
            <Form.Item label="Recipients" name="recipients">
                <Input.TextArea rows={20} autoSize={true}/>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">Parse</Button>
            </Form.Item>
        </Form>

        {dataSource.length > 0 && <>
            <Table dataSource={dataSource}
                   columns={columns.map((column: string) => ({
                       title: column,
                       dataIndex: column,
                       key: column,
                   }))}
            />
            <Button type="primary" onClick={() => {
                props.onFinished({recipients: dataSource});
            }}>It looks perfect!</Button>
        </>}
    </>);

}

export default Recipients;
