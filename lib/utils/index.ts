// ============================================================
// Utility functions used across the application
// ============================================================

import { MAX_TITLE_LENGTH } from '@/lib/constants';

/**
 * Generates a title from the first user message in a conversation.
 * Truncates to MAX_TITLE_LENGTH with ellipsis if needed.
 */
export function generateTitle(content: string): string {
  const cleaned = content.trim().replace(/\n+/g, ' ');
  if (cleaned.length <= MAX_TITLE_LENGTH) return cleaned;
  return cleaned.substring(0, MAX_TITLE_LENGTH - 3) + '...';
}

/**
 * Formats a timestamp (ms) to a human-readable relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: days > 365 ? 'numeric' : undefined,
  });
}

/**
 * Formats a full date/time for message tooltips.
 */
export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats token counts for display in the UI.
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) return count.toString();
  return `${(count / 1000).toFixed(1)}k`;
}

/**
 * Groups conversations by date for sidebar display.
 */
export function groupByDate(
  items: Array<{ updatedAt: number; id: string }>,
): Record<string, typeof items> {
  const groups: Record<string, typeof items> = {};
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;
  const week = today - 7 * 86400000;
  const month = today - 30 * 86400000;

  for (const item of items) {
    let label: string;
    const ts = item.updatedAt;

    if (ts >= today) label = 'Today';
    else if (ts >= yesterday) label = 'Yesterday';
    else if (ts >= week) label = 'This week';
    else if (ts >= month) label = 'This month';
    else label = 'Older';

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return groups;
}

/**
 * Copies text to the clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Truncates a string to maxLength with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Generates a simple unique ID (collision-safe for local use).
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce function for input handlers.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Downloads data as a JSON file.
 */
export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
