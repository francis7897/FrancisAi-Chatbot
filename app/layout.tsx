import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrancisAI — AI Chatbot',
  description: 'A modern AI chatbot powered by Llama 3.3 70B via Groq. Free, fast, and capable.',
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-black text-white flex flex-col antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid #2a2a2a',
              borderRadius: '0.875rem',
              fontSize: '0.875rem',
              padding: '0.875rem 1rem',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#000' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  );
}
