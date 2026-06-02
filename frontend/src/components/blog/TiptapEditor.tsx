'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Quote,
  Undo,
  Redo,
  Code
} from 'lucide-react';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-400 underline hover:text-indigo-300 transition-colors',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 border border-zinc-800 shadow-xl',
        },
      }),
    ],
    content: content || '<p>Bắt đầu viết bài viết của bạn tại đây...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-zinc-100 p-6 leading-relaxed selection:bg-indigo-500/30',
      },
    },
  });

  // Sync content if it changes externally (e.g. loaded from API)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[450px] border border-zinc-800 rounded-xl bg-zinc-950/40 backdrop-blur-md">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const addLink = () => {
    const url = window.prompt('Nhập URL liên kết:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Nhập URL hình ảnh (hoặc đường dẫn thư viện):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full border border-zinc-800/80 rounded-xl bg-zinc-950/30 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-700/80 shadow-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-900/60 border-b border-zinc-800/85 backdrop-blur-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('bold') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="In đậm"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('italic') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="In nghiêng"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('code') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Mã inline"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('heading', { level: 1 }) ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Tiêu đề 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('heading', { level: 2 }) ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Tiêu đề 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('heading', { level: 3 }) ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Tiêu đề 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('bulletList') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Danh sách không thứ tự"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('orderedList') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Danh sách có thứ tự"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('blockquote') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Trích dẫn"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 ${editor.isActive('link') ? 'text-indigo-400 bg-zinc-800/80' : 'text-zinc-400 hover:text-zinc-200'}`}
          title="Chèn liên kết"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          title="Chèn hình ảnh"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:hover:bg-transparent"
          title="Hoàn tác"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:hover:bg-transparent"
          title="Làm lại"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="bg-zinc-950/20 backdrop-blur-sm max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
