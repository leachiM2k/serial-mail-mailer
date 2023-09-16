import { Button, Typography, Upload, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import React from "react";
import { Props } from "./SectionProps";

const {Dragger} = Upload;

const getJsonFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
}

const Attachments: React.FC<Props> = (props: Props) => {

    const [fileList, setFileList] = React.useState<any[]>(getJsonFromLocalStorage('attachments') || []);

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        defaultFileList: fileList,
        beforeUpload: (file) => {
            const f =     {
                    uid: file.uid,
                    name: file.name,
                    path: file.path,
                };
                setFileList((prev) => {
                    const newFileList = [...prev, f];
                    localStorage.setItem('attachments', JSON.stringify(newFileList));
                    return newFileList;
                });
            return false;
        },
        onRemove: (file) => {
            const newFileList = fileList.filter(f => f.uid !== file.uid);
            localStorage.setItem('attachments', JSON.stringify(newFileList));
          setFileList(newFileList);
          return true;
        }
    };

    return (
        <>
            <Typography.Title level={2}>Attachments</Typography.Title>

            <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined/>
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                    banned files.
                </p>
            </Dragger>

            <Button type="primary" style={{marginTop: 16}}
                    onClick={() => props.onFinished({attachments: fileList.map(file => file.path)})}>Next</Button>
        </>);
}

export default Attachments;
