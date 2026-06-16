// ============================================================
// POST /api/chat
// Groq API proxy — uses llama-3.3-70b-versatile (free tier).
// API key stays server-side and is never exposed to the browser.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { ChatRequest, OpenRouterMessage } from '@/lib/types';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL    = 'llama-3.3-70b-versatile';

export const runtime = 'edge';

function parseError(status: number, body: string): string {
  try {
    const j = JSON.parse(body);
    return j.error?.message ?? j.message ?? `HTTP ${status}`;
  } catch {
    return `HTTP ${status}`;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Check API key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not set. Add it to your .env.local file and restart the server.' },
      { status: 500 },
    );
  }

  // 2. Parse request body
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { messages, stream = true, systemPrompt } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages must be a non-empty array.' }, { status: 400 });
  }

  // 3. Build messages with optional system prompt
  const allMessages: OpenRouterMessage[] = [];
  if (systemPrompt?.trim()) {
    allMessages.push({ role: 'system', content: systemPrompt.trim() });
  }
  allMessages.push(...messages);

  // 4. Call Groq
  let res: Response;
  try {
    res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: allMessages,
        stream,
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });
  } catch (networkErr) {
    return NextResponse.json(
      { error: `Network error: ${(networkErr as Error).message}` },
      { status: 500 },
    );
  }

  // 5. Handle errors
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');

    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Groq API key. Check GROQ_API_KEY in your .env.local file.' },
        { status: 401 },
      );
    }
    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Groq rate limit reached. Free tier allows 30 requests/min. Try again in a moment.' },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: parseError(res.status, errBody) },
      { status: res.status },
    );
  }

  // 6. Stream response
  if (stream) {
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  // 7. Non-streaming response
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  const usage = data.usage
    ? {
        promptTokens:     data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens:      data.usage.total_tokens,
      }
    : undefined;

  return NextResponse.json({ content, usage });
}
