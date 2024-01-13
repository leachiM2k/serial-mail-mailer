import React, { useState } from "react";
import { Button, Form, Input, Radio, RadioChangeEvent, Table, Typography, Upload, UploadProps } from "antd";
import Papa, { ParseResult } from "papaparse";
import { Props } from "./SectionProps";
import { InboxOutlined } from "@ant-design/icons";

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

    const initialValues = getJsonFromLocalStorage('recipients');
    const [csvSourceType, setCsvSourceType] = useState<'file' | 'raw'>(initialValues ? 'raw' : 'file');

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

    const uploadProps: UploadProps = {
        multiple: false,
        name: "files",
        accept: "text/csv",
        beforeUpload: (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    const fileContent = e.target.result;
                    recipientsForm.setFieldValue('recipients', fileContent);
                    parseRecipients(fileContent as string);
                }
            };
            reader.readAsText(file);
            return false;
        },
        onRemove: () => {
            setDataSource([]);
            return true;
        }
    };

    return (<>
        <Typography.Title level={2}>Recipients as CSV file</Typography.Title>

        {dataSource.length === 0 && (<>
            <Typography.Paragraph>Upload a CSV file or paste the CSV data into the text area below.</Typography.Paragraph>
            <Typography.Paragraph>The CSV file should be comma-separated and have at least the fields "firstname",
                "lastname" and "email". All other these and other field can be used in the template.</Typography.Paragraph>
            <Form form={recipientsForm} onFinish={handleFinishRecipients}
                  labelCol={{span: 8}}
                  wrapperCol={{span: 16}}
                  initialValues={initialValues}
            >
                <Form.Item label="CSV source">
                    <Radio.Group onChange={(e: RadioChangeEvent) => setCsvSourceType(e.target.value)} value={csvSourceType}>
                        <Radio.Button value="file">CSV file</Radio.Button>
                        <Radio.Button value="raw">raw text</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {csvSourceType === 'raw' && (
                    <>
                        <Form.Item label="Recipients" name="recipients">
                            <Input.TextArea rows={20} autoSize={true}/>
                        </Form.Item>

                        <Form.Item wrapperCol={{offset: 8, span: 16}}>
                            <Button type="primary" htmlType="submit">Parse</Button>
                        </Form.Item>
                    </>)
                }

                {csvSourceType === 'file' &&
                    <Form.Item label="CSV file" name="dragger">
                        <Upload.Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined/>
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                        </Upload.Dragger>
                    </Form.Item>
                }
            </Form>
        </>)}

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
            <Button onClick={() => { setDataSource([]); }}>No, I want to change something</Button>
        </>}
    </>);

}

export default Recipients;
