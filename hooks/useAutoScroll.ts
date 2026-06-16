// ============================================================
// useAutoScroll hook
// Scrolls a container to the bottom whenever content changes,
// but pauses when the user manually scrolls up.
// ============================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseAutoScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  isAtBottom: boolean;
}

export function useAutoScroll(deps: unknown[]): UseAutoScrollReturn {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const userScrolledRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    userScrolledRef.current = false;
    setIsAtBottom(true);
  }, []);

  // Detect when user scrolls away from bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom < 80;
      setIsAtBottom(atBottom);
      userScrolledRef.current = !atBottom;
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when deps change (new messages / streaming tokens)
  useEffect(() => {
    if (!userScrolledRef.current) {
      scrollToBottom('auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, scrollToBottom]);

  return { scrollRef, scrollToBottom, isAtBottom };
}
