// ============================================================
// LocalStorage service — all persistence lives here.
// Safely handles SSR (Next.js server-side) by checking for window.
// ============================================================

import type { Conversation, UserSettings } from '@/lib/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, MAX_CONVERSATIONS } from '@/lib/constants';

// ─── Helpers ────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[Storage] Failed to write:', key, e);
  }
}

function safeRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* swallow */
  }
}

// ─── Conversations ───────────────────────────────────────────

/** Load all conversations, sorted newest-first. */
export function loadConversations(): Conversation[] {
  const all = safeGet<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Persist the full conversations array. Caps at MAX_CONVERSATIONS. */
export function saveConversations(conversations: Conversation[]): void {
  const capped = conversations.slice(0, MAX_CONVERSATIONS);
  safeSet(STORAGE_KEYS.CONVERSATIONS, capped);
}

/** Save a single conversation (upsert). */
export function saveConversation(conversation: Conversation): void {
  const all = loadConversations();
  const idx = all.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    all[idx] = conversation;
  } else {
    all.unshift(conversation);
  }
  saveConversations(all);
}

/** Delete a conversation by id. */
export function deleteConversation(id: string): void {
  const all = loadConversations().filter((c) => c.id !== id);
  saveConversations(all);
}

/** Clear all conversations. */
export function clearAllConversations(): void {
  safeRemove(STORAGE_KEYS.CONVERSATIONS);
  safeRemove(STORAGE_KEYS.ACTIVE_CONVERSATION);
}

// ─── Active conversation ─────────────────────────────────────

export function getActiveConversationId(): string | null {
  return safeGet<string | null>(STORAGE_KEYS.ACTIVE_CONVERSATION, null);
}

export function setActiveConversationId(id: string | null): void {
  if (id === null) {
    safeRemove(STORAGE_KEYS.ACTIVE_CONVERSATION);
  } else {
    safeSet(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
  }
}

// ─── Settings ────────────────────────────────────────────────

export function loadSettings(): UserSettings {
  return safeGet<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: UserSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function resetSettings(): void {
  safeRemove(STORAGE_KEYS.SETTINGS);
}
