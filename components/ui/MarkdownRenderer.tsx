'use client';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils/cn';

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    if (await copyToClipboard(code)) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [code]);

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#111] px-4 py-2.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#222] transition-all">
          {copied
            ? <><Check className="h-3.5 w-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
            : <><Copy className="h-3.5 w-3.5" /><span>Copy</span></>}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.8125rem', lineHeight: '1.65' }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn(
      'prose prose-sm prose-invert max-w-none',
      'prose-headings:font-bold prose-headings:text-white',
      'prose-p:text-gray-200 prose-p:leading-7',
      'prose-a:text-white prose-a:underline hover:prose-a:no-underline',
      'prose-ul:text-gray-200 prose-ol:text-gray-200',
      'prose-blockquote:border-l-white/30 prose-blockquote:text-gray-400',
      'prose-code:bg-[#1a1a1a] prose-code:text-gray-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.8125rem] prose-code:before:content-none prose-code:after:content-none',
      'prose-table:text-gray-200 prose-th:text-white prose-td:border-[#333] prose-th:border-[#333]',
      'prose-hr:border-[#2a2a2a]',
      'prose-strong:text-white prose-em:text-gray-300',
      className,
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = match !== null || String(children).includes('\n');
            if (isBlock) return <CodeBlock language={match?.[1] ?? ''} code={String(children).replace(/\n$/, '')} />;
            return <code className={className}>{children}</code>;
          },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
