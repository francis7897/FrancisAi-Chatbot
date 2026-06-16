// ============================================================
// Application constants — Groq + llama-3.3-70b-versatile
// ============================================================

import type { Model, UserSettings } from '@/lib/types';

export const APP_NAME    = 'NexusAI';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  CONVERSATIONS:       'nexusai_conversations',
  SETTINGS:            'nexusai_settings',
  ACTIVE_CONVERSATION: 'nexusai_active_conversation',
} as const;

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Kept for type compatibility — single model, no switching
export const FALLBACK_MODELS = ['llama-3.3-70b-versatile'] as const;

export const FREE_MODELS: Model[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    description: 'Meta · via Groq · blazing fast · free tier',
    contextLength: 131072,
    isFree: true,
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  defaultModel: DEFAULT_MODEL,
  theme: 'dark',
  streamingEnabled: true,
  systemPrompt: 'You are a helpful, harmless, and honest AI assistant. Respond clearly and concisely.',
};

export const RETIRED_MODEL_MAP: Record<string, string> = {
  'meta-llama/llama-3.3-70b-instruct:free': DEFAULT_MODEL,
  'deepseek/deepseek-r1:free':              DEFAULT_MODEL,
  'deepseek/deepseek-chat:free':            DEFAULT_MODEL,
  'deepseek/deepseek-chat-v3-0324:free':    DEFAULT_MODEL,
  'google/gemma-4-31b-it:free':             DEFAULT_MODEL,
  'qwen/qwen3-coder:free':                  DEFAULT_MODEL,
};

export const MAX_TITLE_LENGTH  = 60;
export const MAX_CONVERSATIONS = 100;
export const STREAM_TIMEOUT_MS = 30000;
