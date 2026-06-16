'use client';
import { useState } from 'react';
import { RotateCcw, Download, Trash2 } from 'lucide-react';
import type { UserSettings } from '@/lib/types';
import { Modal }  from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface SettingsPanelProps {
  isOpen:           boolean;
  onClose:          () => void;
  settings:         UserSettings;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onResetSettings:  () => void;
  onExportAll:      () => void;
  onClearAll:       () => void;
}

export function SettingsPanel({
  isOpen, onClose, settings, onUpdateSettings, onResetSettings, onExportAll, onClearAll,
}: SettingsPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-7">

        {/* Groq model card */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">AI Provider</p>
          <div className="flex items-center gap-3">
            {/* Groq logo */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <span className="text-xl font-black text-white leading-none select-none">G</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">Groq</p>
                <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 rounded-md px-2 py-0.5">FREE</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">llama-3.3-70b-versatile · 131k context · blazing fast</p>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Speed',   value: '~600 t/s' },
              { label: 'RPM',     value: '30 / min'  },
              { label: 'RPD',     value: '14,400 / day' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-[#1a1a1a] px-3 py-2 text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
                <p className="text-xs font-semibold text-gray-300 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Streaming toggle */}
        <div className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Real-time streaming</p>
            <p className="text-xs text-gray-500 mt-0.5">See the response appear token by token</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ streamingEnabled: !settings.streamingEnabled })}
            className={cn(
              'relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
              settings.streamingEnabled ? 'bg-orange-500' : 'bg-[#2a2a2a]',
            )}
            role="switch"
            aria-checked={settings.streamingEnabled}
          >
            <span className={cn(
              'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform duration-200',
              settings.streamingEnabled ? 'translate-x-5' : 'translate-x-0',
            )} />
          </button>
        </div>

        {/* System prompt */}
        <div>
          <label className="mb-2.5 block text-sm font-semibold text-white">System prompt</label>
          <textarea
            value={settings.systemPrompt}
            onChange={e => onUpdateSettings({ systemPrompt: e.target.value })}
            rows={4}
            placeholder="You are a helpful AI assistant…"
            className="w-full rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3 text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-orange-500/40 resize-none transition-colors"
          />
          <p className="mt-1.5 text-xs text-gray-600">Sets the AI's behavior for all conversations.</p>
        </div>

        <div className="border-t border-[#1e1e1e]" />

        {/* Data actions */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Data</p>

          <Button
            variant="outline" size="sm" onClick={onExportAll}
            leftIcon={<Download className="h-5 w-5" />}
            className="w-full justify-start text-sm"
          >
            Export all conversations
          </Button>

          {confirmClear ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
              <p className="flex-1 text-xs text-red-300">Permanently delete ALL conversations?</p>
              <Button
                variant="danger" size="xs"
                onClick={() => { onClearAll(); setConfirmClear(false); onClose(); }}
                className="border border-red-500/30"
              >
                Yes, delete
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="danger" size="sm"
              onClick={() => setConfirmClear(true)}
              leftIcon={<Trash2 className="h-5 w-5" />}
              className="w-full justify-start text-sm border border-red-500/20"
            >
              Clear all conversations
            </Button>
          )}
        </div>

        {/* Reset */}
        <div className="flex justify-end border-t border-[#1e1e1e] pt-5">
          <Button
            variant="ghost" size="sm"
            onClick={onResetSettings}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="text-gray-600 text-sm"
          >
            Reset to defaults
          </Button>
        </div>
      </div>
    </Modal>
  );
}
