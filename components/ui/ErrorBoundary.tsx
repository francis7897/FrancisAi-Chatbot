// ============================================================
// ErrorBoundary — catches unhandled React errors and shows
// a friendly message instead of a blank/reloaded page.
// ============================================================

'use client';

import { Component, ReactNode } from 'react';

interface Props   { children: ReactNode; }
interface State   { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center bg-black px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">{this.state.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false, message: '' }); }}
            className="rounded-xl bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
