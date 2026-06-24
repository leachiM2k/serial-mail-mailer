import { Button, ColorPicker, Input, Modal, Space, Tooltip, Divider } from "antd";
import {
    BoldOutlined,
    ItalicOutlined,
    UnorderedListOutlined,
    OrderedListOutlined,
    LinkOutlined,
    UndoOutlined,
    RedoOutlined,
    FontColorsOutlined,
    HighlightOutlined,
} from "@ant-design/icons";
import type { Editor } from "@tiptap/react";
import React from "react";

type Props = {
    editor: Editor | null;
}

const Toolbar: React.FC<Props> = ({ editor }) => {
    const [linkModalOpen, setLinkModalOpen] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState("");

    if (!editor) return null;

    const openLinkModal = () => {
        const previousUrl = editor.getAttributes("link").href as string | undefined;
        setLinkUrl(previousUrl || "");
        setLinkModalOpen(true);
    };

    const handleLinkOk = () => {
        const url = linkUrl.trim();
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
        setLinkModalOpen(false);
    };

    return (
        <>
            <Space wrap style={{ marginBottom: 8, padding: 8, border: "1px solid #d9d9d9", borderRadius: 6 }}>
                <Tooltip title="Bold">
                    <Button
                        size="small"
                        icon={<BoldOutlined/>}
                        type={editor.isActive("bold") ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />
                </Tooltip>

                <Tooltip title="Italic">
                    <Button
                        size="small"
                        icon={<ItalicOutlined/>}
                        type={editor.isActive("italic") ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />
                </Tooltip>

                <Divider type="vertical"/>

                <Tooltip title="Heading 1">
                    <Button
                        size="small"
                        type={editor.isActive("heading", { level: 1 }) ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        H1
                    </Button>
                </Tooltip>

                <Tooltip title="Heading 2">
                    <Button
                        size="small"
                        type={editor.isActive("heading", { level: 2 }) ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        H2
                    </Button>
                </Tooltip>

                <Tooltip title="Heading 3">
                    <Button
                        size="small"
                        type={editor.isActive("heading", { level: 3 }) ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        H3
                    </Button>
                </Tooltip>

                <Divider type="vertical"/>

                <Tooltip title="Bullet list">
                    <Button
                        size="small"
                        icon={<UnorderedListOutlined/>}
                        type={editor.isActive("bulletList") ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    />
                </Tooltip>

                <Tooltip title="Ordered list">
                    <Button
                        size="small"
                        icon={<OrderedListOutlined/>}
                        type={editor.isActive("orderedList") ? "primary" : "default"}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    />
                </Tooltip>

                <Divider type="vertical"/>

                <Tooltip title="Link">
                    <Button
                        size="small"
                        icon={<LinkOutlined/>}
                        type={editor.isActive("link") ? "primary" : "default"}
                        onClick={openLinkModal}
                    />
                </Tooltip>

                <Divider type="vertical"/>

                <Tooltip title="Text color">
                    <ColorPicker
                        size="small"
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        onChangeComplete={(color) => {
                            editor.chain().focus().setColor(color.toHexString()).run();
                        }}
                    >
                        <Button
                            size="small"
                            icon={<FontColorsOutlined/>}
                            type={editor.isActive('textStyle', { color: /.+/ }) ? 'primary' : 'default'}
                        />
                    </ColorPicker>
                </Tooltip>

                <Tooltip title="Background color">
                    <ColorPicker
                        size="small"
                        value={editor.getAttributes('highlight').color || '#ffff00'}
                        onChangeComplete={(color) => {
                            editor.chain().focus().toggleHighlight({ color: color.toHexString() }).run();
                        }}
                    >
                        <Button
                            size="small"
                            icon={<HighlightOutlined/>}
                            type={editor.isActive('highlight') ? 'primary' : 'default'}
                        />
                    </ColorPicker>
                </Tooltip>

                <Divider type="vertical"/>

                <Tooltip title="Undo">
                    <Button
                        size="small"
                        icon={<UndoOutlined/>}
                        disabled={!editor.can().undo()}
                        onClick={() => editor.chain().focus().undo().run()}
                    />
                </Tooltip>

                <Tooltip title="Redo">
                    <Button
                        size="small"
                        icon={<RedoOutlined/>}
                        disabled={!editor.can().redo()}
                        onClick={() => editor.chain().focus().redo().run()}
                    />
                </Tooltip>
            </Space>

            <Modal
                title="Insert link"
                open={linkModalOpen}
                onOk={handleLinkOk}
                onCancel={() => setLinkModalOpen(false)}
                okText="OK"
                cancelText="Cancel"
                destroyOnClose
            >
                <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onPressEnter={handleLinkOk}
                    autoFocus
                />
            </Modal>
        </>
    );
};

export default Toolbar;
