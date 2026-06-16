// ============================================================
// Chat service — handles communication with /api/chat.
// Fixed for Groq SSE format (double-newline delimited chunks).
// ============================================================

import type { ChatRequest, StreamChunk, OpenRouterMessage } from '@/lib/types';

export interface StreamCallbacks {
  onToken:    (token: string) => void;
  onComplete: (usage?: { promptTokens: number; completionTokens: number; totalTokens: number }) => void;
  onError:    (error: Error) => void;
}

export async function streamChatCompletion(
  payload: ChatRequest,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const { onToken, onComplete, onError } = callbacks;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errData.error ?? `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer    = '';
    let lastUsage: StreamChunk['usage'] | undefined;

    while (true) {
      const { done, value } = await reader.read();

      // Flush any remaining buffer on stream end
      if (done) {
        if (buffer.trim()) processLine(buffer.trim());
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Groq sends SSE events separated by \n\n (double newline).
      // Split on \n\n first, then handle individual lines inside each event.
      const events = buffer.split('\n\n');

      // Keep the last incomplete chunk in the buffer
      buffer = events.pop() ?? '';

      for (const event of events) {
        // Each event may have multiple lines (e.g. "event: ...\ndata: ...")
        // We only care about "data:" lines
        for (const line of event.split('\n')) {
          processLine(line.trim());
        }
      }
    }

    onComplete(
      lastUsage
        ? {
            promptTokens:     lastUsage.prompt_tokens,
            completionTokens: lastUsage.completion_tokens,
            totalTokens:      lastUsage.total_tokens,
          }
        : undefined,
    );

    // ── Inner helper — parse one SSE line ──────────────────
    function processLine(line: string): void {
      if (!line || line === 'data: [DONE]' || line === '[DONE]') return;
      if (!line.startsWith('data:')) return;

      const json = line.slice(5).trim(); // strip "data:" and whitespace
      if (!json) return;

      try {
        const chunk = JSON.parse(json) as StreamChunk;

        if (chunk.usage) {
          lastUsage = chunk.usage;
        }

        const delta = chunk.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          onToken(delta);
        }
      } catch {
        // Malformed chunk — skip silently
      }
    }

  } catch (err) {
    // AbortError = user clicked Stop — not a real error
    if ((err as Error).name === 'AbortError') {
      onComplete(undefined);
      return;
    }
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Non-streaming fallback — returns the full response at once.
 */
export async function fetchChatCompletion(
  payload: Omit<ChatRequest, 'stream'>,
  signal?: AbortSignal,
): Promise<{ content: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, stream: false }),
    signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errData.error ?? `HTTP ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content as string,
    usage:   data.usage,
  };
}

/**
 * Trims message history to avoid exceeding context window.
 */
export function buildMessages(
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  maxMessages = 40,
): OpenRouterMessage[] {
  return history.slice(-maxMessages).map(({ role, content }) => ({ role, content }));
}
