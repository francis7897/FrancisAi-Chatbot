'use client';
import { ArrowDown } from 'lucide-react';
import type { Message } from '@/lib/types';
import { ChatMessage }     from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen }   from './WelcomeScreen';
import { useAutoScroll }   from '@/hooks/useAutoScroll';
import { cn } from '@/lib/utils/cn';

interface ChatWindowProps {
  messages:     Message[];
  isLoading:    boolean;
  onSuggestion: (prompt: string) => void;
}

export function ChatWindow({ messages, isLoading, onSuggestion }: ChatWindowProps) {
  const { scrollRef, scrollToBottom, isAtBottom } = useAutoScroll([
    messages.length,
    messages[messages.length - 1]?.content,
    isLoading,
  ]);

  const showTypingIndicator =
    isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user');

  // Show welcome screen when there are no messages at all
  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#222 transparent' }}
      >
        {showWelcome ? (
          <WelcomeScreen onPrompt={onSuggestion} />
        ) : (
          <div className="mx-auto max-w-3xl">
            <div className="h-6" />
            {messages.map(m => <ChatMessage key={m.id} message={m} />)}
            {showTypingIndicator && <TypingIndicator />}
            <div className="h-8" />
          </div>
        )}
      </div>

      {/* Scroll to bottom FAB */}
      <button
        onClick={() => scrollToBottom()}
        className={cn(
          'absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl',
          'bg-white text-black shadow-lg hover:bg-gray-200 transition-all duration-200',
          isAtBottom ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 translate-y-0',
        )}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}
