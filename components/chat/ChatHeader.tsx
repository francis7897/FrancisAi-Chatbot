'use client';
import { Menu, Download, Coins, Zap, ZapOff } from 'lucide-react';
import type { Conversation } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatTokenCount } from '@/lib/utils';

interface ChatHeaderProps {
  conversation:     Conversation | null;
  onToggleSidebar:  () => void;
  onModelChange:    (model: string) => void;
  onExport:         () => void;
  streamingEnabled: boolean;
  onToggleStreaming: () => void;
}

export function ChatHeader({
  conversation, onToggleSidebar, onExport,
  streamingEnabled, onToggleStreaming,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#000]/90 px-4 py-3.5 backdrop-blur-sm">

      {/* Left — burger + conversation title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost" size="sm"
          onClick={onToggleSidebar}
          className="h-10 w-10 p-0 shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
        {conversation && (
          <h1 className="truncate text-sm font-semibold text-gray-200 max-w-xs lg:max-w-md">
            {conversation.title}
          </h1>
        )}
      </div>

      {/* Right — controls + model badge */}
      <div className="flex items-center gap-2">

        {/* Token count */}
        {conversation && conversation.totalTokens > 0 && (
          <Tooltip content="Total tokens used in this conversation" side="bottom">
            <div className="flex items-center gap-1.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-xs font-medium text-gray-400">
              <Coins className="h-4 w-4 text-yellow-400" />
              {formatTokenCount(conversation.totalTokens)}
            </div>
          </Tooltip>
        )}

        {/* Streaming toggle */}
        <Tooltip content={streamingEnabled ? 'Streaming on' : 'Streaming off'} side="bottom">
          <Button
            variant="ghost" size="sm"
            onClick={onToggleStreaming}
            className={`h-10 w-10 p-0 ${streamingEnabled ? 'text-white' : 'text-gray-600'}`}
          >
            {streamingEnabled ? <Zap className="h-6 w-6" /> : <ZapOff className="h-6 w-6" />}
          </Button>
        </Tooltip>

        {/* Export */}
        {conversation && (
          <Tooltip content="Export conversation" side="bottom">
            <Button variant="ghost" size="sm" onClick={onExport} className="h-10 w-10 p-0">
              <Download className="h-6 w-6" />
            </Button>
          </Tooltip>
        )}

        {/* Groq model badge */}
        <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
          {/* Groq logo — orange circle */}
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white leading-none">
            F
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-semibold text-gray-200">Llama 3.3 70B</span>
            <span className="text-[10px] text-gray-500 mt-0.5">via Groq</span>
          </div>
          <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 rounded-md px-1.5 py-0.5 ml-1">
            FREE
          </span>
        </div>
      </div>
    </header>
  );
}
