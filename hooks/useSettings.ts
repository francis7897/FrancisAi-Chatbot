// ============================================================
// useSettings hook
// Manages user preferences (theme, model, system prompt, etc.)
// with automatic localStorage sync.
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/lib/types';
import { loadSettings, saveSettings, resetSettings } from '@/lib/services/storage';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export interface UseSettingsReturn {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme =
      settings.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : settings.theme;

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [settings.theme]);

  // Also listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    resetSettings();
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return {
    settings,
    updateSettings,
    resetToDefaults,
    isSettingsOpen,
    openSettings,
    closeSettings,
  };
}
