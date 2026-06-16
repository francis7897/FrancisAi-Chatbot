// ============================================================
// useChat hook
// Orchestrates sending messages, streaming AI responses,
// and managing loading/error state. Errors are caught here
// and shown inline — never bubble up to crash the page.
// ============================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import type { Message, UserSettings } from '@/lib/types';
import { streamChatCompletion, fetchChatCompletion, buildMessages } from '@/lib/services/chat';
import { generateId } from '@/lib/utils';

interface UseChatOptions {
  conversationId: string | null;
  model:          string;
  settings:       UserSettings;
  messages:       Message[];
  onAddMessage:   (conversationId: string, message: Message) => void;
  onUpdateMessage:(conversationId: string, messageId: string, patch: Partial<Message>) => void;
}

export interface UseChatReturn {
  isLoading:       boolean;
  error:           string | null;
  sendMessage:     (content: string, overrideConvId?: string) => Promise<void>;
  stopGeneration:  () => void;
  clearError:      () => void;
}

export function useChat({
  conversationId, model, settings, messages,
  onAddMessage, onUpdateMessage,
}: UseChatOptions): UseChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const abortRef                  = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // overrideConvId lets page.tsx pass a freshly-created conversation id
  // before React has re-rendered and updated conversationId in this closure.
  const sendMessage = useCallback(async (content: string, overrideConvId?: string): Promise<void> => {
    const targetId = overrideConvId ?? conversationId; // ← use override when provided
    if (!targetId || isLoading) return;

    setError(null);
    setIsLoading(true);

    // 1. Add user message immediately
    const userMessage: Message = {
      id:        generateId(),
      role:      'user',
      content:   content.trim(),
      createdAt: Date.now(),
    };
    onAddMessage(targetId, userMessage);

    // 2. Add empty assistant placeholder for streaming
    const assistantId = generateId();
    const assistantMessage: Message = {
      id:          assistantId,
      role:        'assistant',
      content:     '',
      createdAt:   Date.now(),
      isStreaming: true,
    };
    onAddMessage(targetId, assistantMessage);

    // 3. Build API message history
    const history = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: content.trim() },
    ];
    const apiMessages = buildMessages(history);

    // 4. Abort controller for stop button
    const controller  = new AbortController();
    abortRef.current  = controller;

    // 5. Stream or fetch
    try {
      if (settings.streamingEnabled) {
        let accumulated = '';

        await streamChatCompletion(
          { messages: apiMessages, model, stream: true, systemPrompt: settings.systemPrompt },
          {
            onToken: (token) => {
              accumulated += token;
              onUpdateMessage(targetId, assistantId, {
                content:     accumulated,
                isStreaming: true,
              });
            },
            onComplete: (usage) => {
              onUpdateMessage(targetId, assistantId, {
                content:     accumulated || '_(No response received)_',
                isStreaming: false,
                tokenUsage:  usage
                  ? { promptTokens: usage.promptTokens, completionTokens: usage.completionTokens, totalTokens: usage.totalTokens }
                  : undefined,
              });
              setIsLoading(false);
              abortRef.current = null;
            },
            onError: (err) => {
              onUpdateMessage(targetId, assistantId, {
                content:     accumulated || '',
                isStreaming: false,
              });
              setError(err.message);
              setIsLoading(false);
              abortRef.current = null;
            },
          },
          controller.signal,
        );

      } else {
        // Non-streaming path
        const result = await fetchChatCompletion(
          { messages: apiMessages, model, systemPrompt: settings.systemPrompt },
          controller.signal,
        );
        onUpdateMessage(targetId, assistantId, {
          content:     result.content || '_(No response received)_',
          isStreaming: false,
          tokenUsage:  result.usage
            ? { promptTokens: result.usage.promptTokens, completionTokens: result.usage.completionTokens, totalTokens: result.usage.totalTokens }
            : undefined,
        });
        setIsLoading(false);
        abortRef.current = null;
      }

    } catch (err) {
      // Catch anything that escapes the callbacks — prevents page crash
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== 'AbortError' && !msg.includes('aborted')) {
        onUpdateMessage(targetId, assistantId, { content: '', isStreaming: false });
        setError(msg);
      }
      setIsLoading(false);
      abortRef.current = null;
    }

  }, [conversationId, isLoading, messages, model, settings, onAddMessage, onUpdateMessage]);

  return { isLoading, error, sendMessage, stopGeneration, clearError };
}