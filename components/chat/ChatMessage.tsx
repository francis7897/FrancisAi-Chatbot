'use client';
import { useState, useCallback } from 'react';
import { User, Bot, Copy, Check, Clock } from 'lucide-react';
import type { Message } from '@/lib/types';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/cn';
import { copyToClipboard, formatMessageTime, formatTokenCount } from '@/lib/utils';

function StreamingCursor() {
  return <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-white align-middle" />;
}

export function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isEmpty = !message.content && message.isStreaming;

  const handleCopy = useCallback(async () => {
    if (await copyToClipboard(message.content)) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [message.content]);

  return (
    <div className={cn(
      'group flex gap-4 px-4 py-5',
      isUser ? 'justify-end' : 'justify-start',
    )}>

      {/* AI avatar */}
      {!isUser && (
        <div className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-lg">
          <Bot className="h-5 w-5 text-black" />
        </div>
      )}

      <div className={cn('flex max-w-[82%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'bg-white text-black rounded-br-sm font-medium'
            : 'bg-[#111] text-gray-100 rounded-bl-sm border border-[#2a2a2a]',
        )}>
          {isEmpty
            ? <span className="text-gray-600 italic text-xs">Thinking…</span>
            : isUser
              ? <p className="whitespace-pre-wrap break-words">{message.content}</p>
              : <MarkdownRenderer content={message.content} />}

          {message.isStreaming && !isEmpty && <StreamingCursor />}
        </div>

        {/* Meta */}
        <div className={cn(
          'flex items-center gap-2.5 px-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
          isUser ? 'flex-row-reverse' : 'flex-row',
        )}>
          <Tooltip content={formatMessageTime(message.createdAt)} side={isUser ? 'left' : 'right'}>
            <span className="flex items-center gap-1 text-xs text-gray-700 cursor-default">
              <Clock className="h-3.5 w-3.5" />
              {formatMessageTime(message.createdAt)}
            </span>
          </Tooltip>

          {message.tokenUsage && (
            <span className="text-xs text-gray-700">
              {formatTokenCount(message.tokenUsage.totalTokens)} tokens
            </span>
          )}

          {!message.isStreaming && message.content && (
            <Tooltip content={copied ? 'Copied!' : 'Copy'} side="top">
              <button onClick={handleCopy} className="flex items-center gap-1 rounded-lg p-1.5 text-gray-700 hover:text-white hover:bg-[#1a1a1a] transition-all">
                {copied
                  ? <Check className="h-4 w-4 text-green-400" />
                  : <Copy className="h-4 w-4" />}
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}
