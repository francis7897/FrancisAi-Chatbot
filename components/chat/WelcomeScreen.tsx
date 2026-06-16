'use client';
import { Code2, Globe, BookOpen, Lightbulb, BrainCircuit, FileText,Zap } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Code2,        label: 'Explain a concept', prompt: 'Explain how React Server Components work and when to use them.' },
  { icon: Globe,        label: 'Translate text',     prompt: 'Translate "Hello, how are you?" into 5 different languages with pronunciation tips.' },
  { icon: BookOpen,     label: 'Summarize content',  prompt: 'Summarize the key principles of clean code in concise bullet points.' },
  { icon: Lightbulb,    label: 'Brainstorm ideas',   prompt: 'Give me 10 unique app ideas that solve real everyday problems.' },
  { icon: BrainCircuit, label: 'Debug code',         prompt: 'Here\'s my code — can you help me find and fix the bug?\n\n```js\n// paste your code here\n```' },
  { icon: FileText,     label: 'Write content',      prompt: 'Write a professional LinkedIn post about the importance of continuous learning in tech.' },
];

// Groq logo mark — orange G
function GroqLogo() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white">
              <Zap className="h-10 w-10 text-black" />
            </div>
  );
}

export function WelcomeScreen({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">

      <GroqLogo />

      <h2 className="text-3xl font-bold text-white mb-3 text-center tracking-tight">
        How can I help you today?
      </h2>

      {/* Groq + model pill */}
      <div className="flex items-center gap-2 mb-10">
        <span className="flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1.5 text-xs text-gray-400">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white leading-none">G</span>
          Powered by Groq
        </span>
        <span className="rounded-full border border-[#2a2a2a] bg-[#111] px-3 py-1.5 text-xs text-gray-400">
          Created by: Francis Minguito
        </span>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400">
          Free
        </span>
      </div>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => onPrompt(prompt)}
            className="group flex items-start gap-3.5 rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] p-4 text-left transition-all hover:border-orange-500/30 hover:bg-[#111]"
          >
            <div className="mt-0.5 shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
              <Icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
