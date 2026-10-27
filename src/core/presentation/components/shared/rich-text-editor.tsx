'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
  error?: string;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'ປ້ອນເນື້ອຫາ...',
  disabled = false,
  minHeight = '140px',
  className,
  error,
}: RichTextEditorProps) {
  const [isEmpty, setIsEmpty] = useState(!value || value === '<p></p>');
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onFocus: () => setIsFocused(true),
    onBlur: ({ editor: currentEditor }) => {
      setIsFocused(false);
      setIsEmpty(currentEditor.isEmpty);
    },
    onUpdate: ({ editor: currentEditor }) => {
      setIsEmpty(currentEditor.isEmpty);
      const html = currentEditor.isEmpty ? '' : currentEditor.getHTML();
      onChange?.(html);
    },
  });

  // Sync external value changes safely without losing cursor position
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const isBothEmpty = (!value || value === '<p></p>') && editor.isEmpty;
    if (!isBothEmpty && value !== currentHtml) {
      editor.commands.setContent(value || '', { emitUpdate: false });
      setIsEmpty(editor.isEmpty);
    }
  }, [value, editor]);

  // Sync editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div
        style={{ minHeight }}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 animate-pulse flex items-center justify-center text-xs text-slate-400"
      >
        ກຳລັງໂຫຼດຕົວແກ້ໄຂຂໍ້ຄວາມ...
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15',
        disabled && 'opacity-60 pointer-events-none bg-slate-50/60',
        error && 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/15',
        className
      )}
    >
      {/* 1. Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50/80 border-b border-slate-200/70 text-slate-600 select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="ຍົກເລີກ (Undo)"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="ເຮັດຄືນ (Redo)"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={cn(
            'px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer',
            editor.isActive('paragraph')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ຂໍ້ຄວາມທຳມະດາ"
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'p-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ຫົວຂໍ້ໃຫຍ່ (H2)"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            'p-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
            editor.isActive('heading', { level: 3 })
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ຫົວຂໍ້ຍ່ອຍ (H3)"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

        {/* Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('bold')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ໂຕເຂັ້ມ (Bold)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('italic')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ໂຕອຽງ (Italic)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('strike')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ຂີດຂ້າ (Strike)"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('code')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ໂຄ້ດ (Inline Code)"
        >
          <Code className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('bulletList')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ລາຍການຈຸດ (Bullet List)"
        >
          <List className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('orderedList')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ລາຍການລຳດັບ (Numbered List)"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            'p-1.5 rounded-lg transition cursor-pointer',
            editor.isActive('blockquote')
              ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
              : 'hover:bg-slate-200/70 text-slate-600'
          )}
          title="ຂໍ້ຄວາມອ້າງອີງ (Quote)"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
          title="ເສັ້ນຂັ້ນ (Horizontal Rule)"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          title="ລ້າງຮູບແບບ (Clear Formatting)"
        >
          <Eraser className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 2. Editor Body */}
      <div className="relative p-3.5 text-xs text-slate-800 tiptap-content tiptap-editor-container">
        <style>{`
          .tiptap-editor-container .ProseMirror {
            outline: none;
            min-height: inherit;
          }
          .tiptap-editor-container .ProseMirror ul {
            list-style: disc inside !important;
            list-style-type: disc !important;
            list-style-position: inside !important;
            padding-left: 0.5rem !important;
            margin: 0.35rem 0 !important;
          }
          .tiptap-editor-container .ProseMirror ol {
            list-style: decimal inside !important;
            list-style-type: decimal !important;
            list-style-position: inside !important;
            padding-left: 0.5rem !important;
            margin: 0.35rem 0 !important;
          }
          .tiptap-editor-container .ProseMirror li {
            display: list-item !important;
            list-style-type: inherit !important;
            list-style-position: inside !important;
            margin: 0.2rem 0 !important;
          }
          .tiptap-editor-container .ProseMirror li > p {
            display: inline !important;
            margin: 0 !important;
          }
          .tiptap-editor-container .ProseMirror p {
            margin: 0.3rem 0 !important;
            line-height: 1.65 !important;
          }
        `}</style>
        {isEmpty && !isFocused && (
          <div className="absolute top-3.5 left-3.5 text-slate-400 pointer-events-none select-none text-xs">
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          style={{ minHeight }}
          className="min-h-[140px] focus:outline-none"
        />
      </div>

      {/* Error message */}
      {error && <p className="px-3 pb-2 text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}
