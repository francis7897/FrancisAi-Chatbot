// ============================================================
// Core type definitions for the AI chatbot application
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  tokenUsage?: TokenUsage;
  isStreaming?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  totalTokens: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  isFree: boolean;
}

export interface UserSettings {
  defaultModel: string;
  theme: 'light' | 'dark' | 'system';
  streamingEnabled: boolean;
  systemPrompt: string;
}

export interface ChatRequest {
  messages: OpenRouterMessage[];
  model: string;
  stream: boolean;
  systemPrompt?: string;
}

export interface OpenRouterMessage {
  role: MessageRole;
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ToastOptions {
  type: 'success' | 'error' | 'loading' | 'info';
  message: string;
  duration?: number;
}

export interface ExportData {
  exportedAt: string;
  version: string;
  conversations: Conversation[];
}
