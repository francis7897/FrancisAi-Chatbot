// ============================================================
// useConversations hook
// Manages the full list of conversations: CRUD, active selection,
// and LocalStorage sync. Single source of truth for sidebar + chat.
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '@/lib/types';
import {
  loadConversations,
  saveConversation,
  deleteConversation as deleteConvStorage,
  clearAllConversations,
  getActiveConversationId,
  setActiveConversationId,
} from '@/lib/services/storage';
import { generateId, generateTitle, downloadJSON } from '@/lib/utils';
import { DEFAULT_MODEL, RETIRED_MODEL_MAP } from '@/lib/constants';

export interface UseConversationsReturn {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeId: string | null;

  createConversation: (model?: string) => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  clearAll: () => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  updateConversationModel: (conversationId: string, model: string) => void;
  exportConversation: (id: string) => void;
  exportAll: () => void;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Bootstrap from localStorage on mount ──
  useEffect(() => {
    const stored = loadConversations();

    // Auto-migrate any stale/retired model slugs to current working ones
    const migrated = stored.map((c) => {
      const replacement = RETIRED_MODEL_MAP[c.model];
      return replacement ? { ...c, model: replacement } : c;
    });

    // Persist migrations back to storage
    migrated.forEach((c, i) => {
      if (c.model !== stored[i]?.model) saveConversation(c);
    });

    setConversations(migrated);

    const savedActive = getActiveConversationId();
    if (savedActive && migrated.find((c) => c.id === savedActive)) {
      setActiveId(savedActive);
    }
  }, []);

  // ── Derived: active conversation object ──
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // ── Actions ──────────────────────────────────────────────

  const createConversation = useCallback(
    (model = DEFAULT_MODEL): Conversation => {
      const now = Date.now();
      const conv: Conversation = {
        id: generateId(),
        title: 'New conversation',
        messages: [],
        createdAt: now,
        updatedAt: now,
        model,
        totalTokens: 0,
      };
      saveConversation(conv);
      // Functional update — no stale closure on conversations
      setConversations(prev =>
        [...[conv, ...prev]].sort((a, b) => b.updatedAt - a.updatedAt),
      );
      setActiveId(conv.id);
      setActiveConversationId(conv.id);
      return conv;
    },
    [],
  );

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      deleteConvStorage(id);
      setConversations(prev => {
        const remaining = prev.filter((c) => c.id !== id);
        return [...remaining].sort((a, b) => b.updatedAt - a.updatedAt);
      });
      setActiveId(prev => {
        if (prev !== id) return prev;
        // Compute next from current conversations state; fall back to null
        const remaining = conversations.filter((c) => c.id !== id);
        const next = remaining[0] ?? null;
        setActiveConversationId(next?.id ?? null);
        return next?.id ?? null;
      });
    },
    [conversations],
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      setConversations(prev => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() } : c,
        );
        const conv = updated.find((c) => c.id === id);
        if (conv) saveConversation(conv);
        return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [],
  );

  const clearAll = useCallback(() => {
    clearAllConversations();
    setConversations([]);
    setActiveId(null);
  }, []);

  // ── addMessage — functional update avoids stale closure ──
  const addMessage = useCallback(
    (conversationId: string, message: Message) => {
      setConversations(prev => {
        const updated = prev.map((c) => {
          if (c.id !== conversationId) return c;
          const newMessages = [...c.messages, message];
          const title =
            c.messages.length === 0 && message.role === 'user'
              ? generateTitle(message.content)
              : c.title;
          const totalTokens = c.totalTokens + (message.tokenUsage?.totalTokens ?? 0);
          const conv = { ...c, messages: newMessages, title, updatedAt: Date.now(), totalTokens };
          saveConversation(conv);
          return conv;
        });
        return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [], // no dependency on conversations — always reads fresh via prev
  );

  // ── updateMessage — functional update avoids stale closure ──
  // This is critical for streaming: called dozens of times per response.
  const updateMessage = useCallback(
    (conversationId: string, messageId: string, patch: Partial<Message>) => {
      setConversations(prev => {
        const updated = prev.map((c) => {
          if (c.id !== conversationId) return c;
          const messages = c.messages.map((m) =>
            m.id === messageId ? { ...m, ...patch } : m,
          );
          const totalTokens = messages.reduce(
            (sum, m) => sum + (m.tokenUsage?.totalTokens ?? 0),
            0,
          );
          const conv = { ...c, messages, updatedAt: Date.now(), totalTokens };
          saveConversation(conv);
          return conv;
        });
        return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [], // no dependency on conversations — always reads fresh via prev
  );

  const updateConversationModel = useCallback(
    (conversationId: string, model: string) => {
      setConversations(prev => {
        const updated = prev.map((c) => {
          if (c.id !== conversationId) return c;
          const conv = { ...c, model, updatedAt: Date.now() };
          saveConversation(conv);
          return conv;
        });
        return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [],
  );

  const exportConversation = useCallback(
    (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      downloadJSON(
        { exportedAt: new Date().toISOString(), version: '1.0.0', conversation: conv },
        `nexusai-${conv.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`,
      );
    },
    [conversations],
  );

  const exportAll = useCallback(() => {
    downloadJSON(
      { exportedAt: new Date().toISOString(), version: '1.0.0', conversations },
      `nexusai-all-chats-${Date.now()}.json`,
    );
  }, [conversations]);

  return {
    conversations,
    activeConversation,
    activeId,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    clearAll,
    addMessage,
    updateMessage,
    updateConversationModel,
    exportConversation,
    exportAll,
  };
}