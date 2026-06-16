'use client';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ErrorBannerProps {
  message:   string;
  onDismiss: () => void;
  onRetry?:  () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, onRetry, className }: ErrorBannerProps) {
  return (
    <div role="alert" className={cn(
      'mx-auto max-w-3xl flex items-start gap-3 rounded-xl my-3',
      'border border-red-500/30 bg-red-500/10 px-4 py-3',
      'animate-in slide-in-from-bottom-2 duration-200',
      className,
    )}>
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-300">Something went wrong</p>
        <p className="mt-0.5 text-xs text-red-400/80 break-words">{message}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onRetry && (
          <button onClick={onRetry} className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors font-medium">
            Retry
          </button>
        )}
        <button onClick={onDismiss} className="rounded-lg p-1.5 text-red-500 hover:text-red-300 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
