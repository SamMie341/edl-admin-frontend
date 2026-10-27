'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RichTextRendererProps {
  content?: string | null;
  className?: string;
  emptyPlaceholder?: string;
}

/**
 * Format string to HTML, converting plain text newlines to paragraphs if not already HTML
 */
export function formatRichText(html?: string | null): string {
  if (!html) return '';
  const trimmed = html.trim();
  // Check if string contains HTML tags
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (!hasHtmlTags) {
    return trimmed
      .split('\n')
      .map((line) => `<p>${line.trim() || '&nbsp;'}</p>`)
      .join('');
  }
  return trimmed;
}

export function RichTextRenderer({
  content,
  className,
  emptyPlaceholder = 'ບໍ່ມີຂໍ້ມູນ',
}: RichTextRendererProps) {
  if (
    !content ||
    !content.trim() ||
    content === '<p></p>' ||
    content === '<p><br></p>' ||
    content === '<p><br/></p>'
  ) {
    return (
      <p className="text-slate-400 italic text-xs">{emptyPlaceholder}</p>
    );
  }

  const formattedHtml = formatRichText(content);

  return (
    <div
      className={cn(
        'rich-text-rendered text-xs text-slate-700 leading-relaxed max-w-none',
        className
      )}
    >
      <style>{`
        .rich-text-rendered ul,
        .rich-text-rendered .tiptap-content ul {
          list-style: disc inside !important;
          list-style-type: disc !important;
          list-style-position: inside !important;
          margin-top: 0.35rem !important;
          margin-bottom: 0.35rem !important;
          padding-left: 0.5rem !important;
        }
        .rich-text-rendered ol,
        .rich-text-rendered .tiptap-content ol {
          list-style: decimal inside !important;
          list-style-type: decimal !important;
          list-style-position: inside !important;
          margin-top: 0.35rem !important;
          margin-bottom: 0.35rem !important;
          padding-left: 0.5rem !important;
        }
        .rich-text-rendered li,
        .rich-text-rendered .tiptap-content li {
          display: list-item !important;
          list-style-type: inherit !important;
          list-style-position: inside !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-text-rendered li > p,
        .rich-text-rendered .tiptap-content li > p {
          display: inline !important;
          margin: 0 !important;
        }
        .rich-text-rendered p,
        .rich-text-rendered .tiptap-content p {
          margin-top: 0.35rem !important;
          margin-bottom: 0.35rem !important;
          line-height: 1.65 !important;
        }
        .rich-text-rendered h1,
        .rich-text-rendered .tiptap-content h1 {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          margin-top: 0.85rem !important;
          margin-bottom: 0.4rem !important;
          color: #0f172a !important;
        }
        .rich-text-rendered h2,
        .rich-text-rendered .tiptap-content h2 {
          font-size: 1.15rem !important;
          font-weight: 700 !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.35rem !important;
          color: #0f172a !important;
        }
        .rich-text-rendered h3,
        .rich-text-rendered .tiptap-content h3 {
          font-size: 1rem !important;
          font-weight: 600 !important;
          margin-top: 0.6rem !important;
          margin-bottom: 0.25rem !important;
          color: #0f172a !important;
        }
        .rich-text-rendered strong,
        .rich-text-rendered b,
        .rich-text-rendered .tiptap-content strong,
        .rich-text-rendered .tiptap-content b {
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        .rich-text-rendered em,
        .rich-text-rendered i,
        .rich-text-rendered .tiptap-content em,
        .rich-text-rendered .tiptap-content i {
          font-style: italic !important;
        }
        .rich-text-rendered s,
        .rich-text-rendered strike,
        .rich-text-rendered .tiptap-content s,
        .rich-text-rendered .tiptap-content strike {
          text-decoration: line-through !important;
        }
        .rich-text-rendered blockquote,
        .rich-text-rendered .tiptap-content blockquote {
          border-left: 3px solid #2563eb !important;
          padding-left: 0.85rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          color: #334155 !important;
          font-style: italic !important;
          background-color: #f8fafc !important;
          padding-top: 0.35rem !important;
          padding-bottom: 0.35rem !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
        }
        .rich-text-rendered hr,
        .rich-text-rendered .tiptap-content hr {
          border: none !important;
          border-top: 1px solid #e2e8f0 !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.75rem !important;
        }
        .rich-text-rendered code,
        .rich-text-rendered .tiptap-content code {
          background-color: #f1f5f9 !important;
          padding: 0.15rem 0.4rem !important;
          border-radius: 0.375rem !important;
          font-family: var(--font-mono) !important;
          font-size: 0.85em !important;
          color: #0f172a !important;
        }
        .rich-text-rendered pre,
        .rich-text-rendered .tiptap-content pre {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          padding: 0.75rem !important;
          border-radius: 0.5rem !important;
          font-family: var(--font-mono) !important;
          font-size: 0.85em !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          overflow-x: auto !important;
        }
      `}</style>
      <div
        className="tiptap-content"
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    </div>
  );
}
