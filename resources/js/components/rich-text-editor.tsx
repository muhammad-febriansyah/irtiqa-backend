import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link2,
    Image as ImageIcon,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Masukkan URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Masukkan URL gambar:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const MenuButton = ({ onClick, active, disabled, children, title }: any) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'h-8 w-8 p-0',
                active && 'bg-muted'
            )}
            title={title}
        >
            {children}
        </Button>
    );

    return (
        <div className="border rounded-md overflow-hidden">
            {/* Toolbar */}
            <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    title="Code"
                >
                    <Code className="size-4" />
                </MenuButton>

                <div className="w-px h-8 bg-border mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="size-4" />
                </MenuButton>

                <div className="w-px h-8 bg-border mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="size-4" />
                </MenuButton>

                <div className="w-px h-8 bg-border mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="size-4" />
                </MenuButton>

                <div className="w-px h-8 bg-border mx-1" />

                <MenuButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
                    <Link2 className="size-4" />
                </MenuButton>

                <MenuButton onClick={addImage} title="Add Image">
                    <ImageIcon className="size-4" />
                </MenuButton>

                <div className="w-px h-8 bg-border mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo className="size-4" />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo className="size-4" />
                </MenuButton>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
}
