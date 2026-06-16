'use client';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => { timer.current = setTimeout(() => setVisible(true), delay); }, [delay]);
  const hide = useCallback(() => { if (timer.current) clearTimeout(timer.current); setVisible(false); }, []);

  const pos = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && content && (
        <div className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg',
          'bg-white text-black px-2.5 py-1.5 text-xs font-medium shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-100',
          pos[side],
        )}>
          {content}
        </div>
      )}
    </div>
  );
}
