'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  size?:     'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', key); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog" aria-modal="true"
        className={cn(
          'relative w-full rounded-2xl bg-[#111] shadow-2xl',
          'border border-[#2a2a2a]',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          sizes[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-5">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
