# NexusAI — Production-Ready AI Chatbot

A modern, ChatGPT-style AI chatbot built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, and **OpenRouter** free models. Deploy instantly to Vercel.

---

## ✨ Features

- **Real-time streaming** — see AI responses token-by-token
- **Sidebar with full conversation history** — create, rename, delete, search
- **Markdown + syntax highlighting** — beautiful code blocks with copy button
- **Multiple free AI models** — DeepSeek V3, Llama 4, Gemma 3, Mistral, and more
- **Dark/light/system theme** — respects OS preference
- **Token usage display** — see how many tokens each conversation uses
- **Export conversations** — download as JSON
- **Secure API key** — key never leaves the server; all requests proxied via `/api/chat`
- **Mobile-first responsive** — collapsible sidebar, works on all screen sizes
- **Auto-scroll with manual override** — scroll up to read history, FAB to snap back
- **Persistent chat history** — stored in localStorage, survives page refresh
- **Settings panel** — system prompt, default model, streaming toggle
- **Toast notifications** — feedback for all user actions
- **Error handling** — inline error banner with dismiss

---

## 🚀 Quick Start

### 1. Clone or download

```bash
git clone <your-repo>
cd ai-chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your API key

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get a **free** key at [openrouter.ai/keys](https://openrouter.ai/keys) — no credit card needed.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it works immediately.

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

When prompted, add the environment variable:
- **Key:** `OPENROUTER_API_KEY`
- **Value:** your key from openrouter.ai

### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Under **Environment Variables**, add `OPENROUTER_API_KEY`
5. Click **Deploy**

---

## 📁 Project Structure

```
ai-chatbot/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # Secure OpenRouter proxy (Edge Runtime)
│   │   └── models/route.ts      # Returns available free models
│   ├── globals.css              # Tailwind v4 + custom animations
│   ├── layout.tsx               # Root layout with metadata + Toaster
│   └── page.tsx                 # Main page — composes all components
│
├── components/
│   ├── chat/
│   │   ├── ChatHeader.tsx       # Model selector, token count, controls
│   │   ├── ChatInput.tsx        # Auto-resize textarea, send/stop button
│   │   ├── ChatMessage.tsx      # Message bubble with markdown + copy
│   │   ├── ChatWindow.tsx       # Scrollable message list
│   │   ├── SettingsPanel.tsx    # Settings modal
│   │   ├── TypingIndicator.tsx  # Animated dots
│   │   └── WelcomeScreen.tsx    # Empty state with suggestions
│   ├── layout/
│   │   └── Sidebar.tsx          # Conversation list + CRUD actions
│   └── ui/
│       ├── Button.tsx           # Reusable button with variants
│       ├── ErrorBanner.tsx      # Inline dismissable error
│       ├── MarkdownRenderer.tsx # react-markdown + syntax highlighting
│       ├── Modal.tsx            # Accessible dialog
│       └── Tooltip.tsx          # Hover tooltip
│
├── hooks/
│   ├── useAutoScroll.ts         # Smart scroll-to-bottom
│   ├── useChat.ts               # Streaming chat state machine
│   ├── useConversations.ts      # All conversation CRUD + persistence
│   └── useSettings.ts           # User preferences + theme
│
├── lib/
│   ├── constants.ts             # Models list, defaults, storage keys
│   ├── services/
│   │   ├── chat.ts              # streamChatCompletion() + buildMessages()
│   │   └── storage.ts           # localStorage read/write service
│   ├── types/index.ts           # All TypeScript types
│   └── utils/
│       ├── cn.ts                # className merger
│       └── index.ts             # Utility functions
│
├── .env.example                 # Template for environment variables
├── .env.local                   # Your actual key (gitignored)
├── vercel.json                  # Vercel deployment config
├── next.config.ts               # Next.js + security headers
└── tsconfig.json                # Strict TypeScript config
```

---

## 🤖 Available Free Models

| Model | Context | Notes |
|-------|---------|-------|
| DeepSeek V3 (default) | 65k | Fast, capable general purpose |
| DeepSeek R1 | 65k | Chain-of-thought reasoning |
| Llama 4 Maverick | 128k | Meta's multimodal model |
| Llama 4 Scout | 128k | Efficient Llama 4 variant |
| Gemma 3 27B | 128k | Google's open model |
| Phi-4 Reasoning | 16k | Microsoft reasoning model |
| Qwen3 14B | 40k | Alibaba's Qwen3 |
| Mistral 7B | 32k | Fast and efficient |

All models are **completely free** via OpenRouter.

---

## 🔧 Troubleshooting

### "OpenRouter API key is not configured"
- Make sure `.env.local` exists and contains `OPENROUTER_API_KEY=sk-or-...`
- Restart the dev server after adding the key: `npm run dev`

### "Failed to fetch" / network errors
- Check your API key is valid at [openrouter.ai/keys](https://openrouter.ai/keys)
- Some free models have rate limits — try switching models in the header

### Streaming doesn't work on Vercel
- The `/api/chat` route uses Edge Runtime for fast streaming — this is Vercel-native
- Make sure you haven't disabled edge functions in your Vercel project settings

### LocalStorage is empty after deploy
- localStorage is browser-local — each device/browser has its own history
- Use the Export feature to back up conversations

### Build fails with TypeScript errors
```bash
npx tsc --noEmit  # See all type errors
```

---

## 🛡️ Security

- **API key is server-side only** — it's in `OPENROUTER_API_KEY` (server env var) and accessed only in `/api/chat/route.ts`. It is never sent to the browser.
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.) are set in `next.config.ts`
- No user data is sent to any third party except OpenRouter (your messages go to the model provider)

---

## 📄 License

MIT — use freely in personal and commercial projects.
