'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/cn';

const MAX_LENGTH = 8000;

interface ChatInputProps {
  onSubmit:    (content: string) => void;
  onStop:      () => void;
  isLoading:   boolean;
  disabled?:   boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, onStop, isLoading, disabled = false, placeholder = 'Ask anything…' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 220)}px`;
  }, [value]);

  const handleSubmit = useCallback(() => {
    const t = value.trim();
    if (!t || isLoading || disabled) return;
    onSubmit(t);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, isLoading, disabled, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }, [handleSubmit]);

  const canSubmit   = value.trim().length > 0 && !disabled;
  const isNearLimit = value.length > MAX_LENGTH * 0.85;

  return (
    <div className="relative">
      <div className={cn(
        'relative flex items-end gap-3 rounded-2xl border bg-[#111] px-4 py-3.5',
        'transition-all duration-150',
        'border-[#2a2a2a] focus-within:border-white/30 focus-within:shadow-lg focus-within:shadow-white/5',
      )}>
        <textarea
          ref={textareaRef} value={value}
          onChange={e => setValue(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-600 outline-none min-h-[24px] max-h-[220px] leading-6 disabled:opacity-50"
        />

        <div className="flex shrink-0 items-end gap-2 pb-0.5">
          {isNearLimit && (
            <span className={cn('text-xs tabular-nums', value.length >= MAX_LENGTH ? 'text-red-400' : 'text-gray-600')}>
              {MAX_LENGTH - value.length}
            </span>
          )}

          {isLoading ? (
            <Tooltip content="Stop generating" side="top">
              <button onClick={onStop}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black hover:bg-gray-200 transition-colors shadow-sm"
              >
                <Square className="h-5 w-5 fill-current" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Send (Enter)" side="top">
              <button onClick={handleSubmit} disabled={!canSubmit}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
                  canSubmit
                    ? 'bg-white text-black hover:bg-gray-200 shadow-sm'
                    : 'bg-[#1a1a1a] text-gray-700 cursor-not-allowed',
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-700">
        Enter to send · Shift+Enter for newline · AI may make mistakes
      </p>
    </div>
  );
}
