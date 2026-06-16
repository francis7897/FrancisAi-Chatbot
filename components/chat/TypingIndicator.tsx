'use client';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 px-4 py-5">
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-lg">
        <Bot className="h-5 w-5 text-black" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-[#111] border border-[#2a2a2a] px-5 py-4">
        {[0, 1, 2].map(i => (
          <span key={i} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
    </div>
  );
}
