import React, { useState } from "react";
import { Button, Form, Input, InputRef, Radio, RadioChangeEvent, Table, Typography, Upload, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, InboxOutlined, PlusOutlined } from "@ant-design/icons";
import Papa, { ParseResult } from "papaparse";
import { Props } from "./SectionProps";
import { getJsonFromLocalStorage } from "../shared/storage";

export type RecipientType = {
    [key: string]: string;
}

type EditableCellProps = {
    editable: boolean;
    children: React.ReactNode;
    dataIndex: string;
    record: RecipientType;
    rowIndex: number;
    isEditing: boolean;
    handleSave: (rowIndex: number, dataIndex: string, value: string) => void;
    onStartEdit: (rowIndex: number, dataIndex: string) => void;
    onTab: (rowIndex: number, dataIndex: string, shift: boolean) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editable,
    children,
    dataIndex,
    record,
    rowIndex,
    isEditing,
    handleSave,
    onStartEdit,
    onTab,
    ...restProps
}) => {
    const [value, setValue] = useState(record?.[dataIndex] || '');
    const inputRef = React.useRef<InputRef>(null);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    React.useEffect(() => {
        if (record) {
            setValue(record[dataIndex] || '');
        }
    }, [record, dataIndex]);

    const save = () => {
        handleSave(rowIndex, dataIndex, value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            save();
            onTab(rowIndex, dataIndex, e.shiftKey);
        } else if (e.key === 'Enter') {
            save();
        }
    };

    let childNode = children;

    if (editable) {
        childNode = isEditing ? (
            <Input
                ref={inputRef}
                size="small"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={save}
            />
        ) : (
            <div
                style={{
                    minHeight: 22,
                    cursor: 'pointer',
                    padding: '1px 4px',
                    borderRadius: 4,
                }}
                onClick={() => onStartEdit(rowIndex, dataIndex)}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

const Recipients: React.FC<Props> = (props: Props) => {
    const [recipientsForm] = Form.useForm();

    const initialValues = getJsonFromLocalStorage<{ recipients?: string }>('recipients');
    const [csvSourceType, setCsvSourceType] = useState<'file' | 'raw'>(initialValues ? 'raw' : 'file');

    const [dataSource, setDataSource] = useState<RecipientType[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; dataIndex: string } | null>(null);

    const handleFinishRecipients = (values: { recipients: string }) => {
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

    const handleSave = (rowIndex: number, dataIndex: string, value: string) => {
        setDataSource(prev => prev.map((item, i) =>
            i === rowIndex ? { ...item, [dataIndex]: value } : item
        ));
    };

    const handleStartEdit = (rowIndex: number, dataIndex: string) => {
        setEditingCell({ rowIndex, dataIndex });
    };

    const handleTab = (rowIndex: number, dataIndex: string, shift: boolean) => {
        const colIndex = columns.indexOf(dataIndex);
        if (shift) {
            if (colIndex > 0) {
                setEditingCell({ rowIndex, dataIndex: columns[colIndex - 1] });
            }
        } else {
            if (colIndex < columns.length - 1) {
                setEditingCell({ rowIndex, dataIndex: columns[colIndex + 1] });
            }
        }
    };

    const handleDelete = (index: number) => {
        setDataSource(prev => prev.filter((_, i) => i !== index));
        if (editingCell?.rowIndex === index) {
            setEditingCell(null);
        }
    };

    const handleAdd = () => {
        const emptyRow: RecipientType = {};
        columns.forEach(col => { emptyRow[col] = ''; });
        const newIndex = dataSource.length;
        setDataSource(prev => [...prev, emptyRow]);
        setEditingCell({ rowIndex: newIndex, dataIndex: columns[0] });
    };

    const handleClearAll = () => {
        setDataSource([]);
        setColumns([]);
        setEditingCell(null);
    };

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

    const tableColumns: ColumnsType<RecipientType> = [
        ...columns.map((column: string) => ({
            title: column,
            dataIndex: column,
            key: column,
            onCell: (record: RecipientType, rowIndex: number | undefined): EditableCellProps & React.TdHTMLAttributes<HTMLElement> => ({
                record,
                rowIndex: rowIndex ?? 0,
                dataIndex: column,
                editable: true,
                isEditing: editingCell?.rowIndex === rowIndex && editingCell?.dataIndex === column,
                handleSave,
                onStartEdit: handleStartEdit,
                onTab: handleTab,
            } as EditableCellProps & React.TdHTMLAttributes<HTMLElement>),
        })),
        {
            title: '',
            dataIndex: 'action',
            width: 50,
            render: (_: unknown, __: RecipientType, index: number) => (
                <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined/>}
                    onClick={() => handleDelete(index)}
                />
            ),
        },
    ];

    const components = {
        body: {
            cell: EditableCell,
        },
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
                    <Form.Item label="CSV file">
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
            <Table
                dataSource={dataSource}
                rowKey={(_, index) => index?.toString() || Math.random().toString()}
                columns={tableColumns}
                components={components}
                pagination={false}
                scroll={{ y: 400 }}
            />
            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button icon={<PlusOutlined/>} onClick={handleAdd}>Add row</Button>
                <Button danger onClick={handleClearAll}>Clear all</Button>
                <Button type="primary" onClick={() => {
                    props.onFinished({recipients: dataSource});
                }}>It looks perfect!</Button>
            </div>
        </>}
    </>);

}

export default Recipients;
