'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus, Search, MessageSquare, Trash2, Pencil, Check, X,
  Download, Settings, ChevronLeft, Zap, MoreHorizontal,
} from 'lucide-react';
import type { Conversation } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime, groupByDate } from '@/lib/utils';

interface SidebarProps {
  conversations:  Conversation[];
  activeId:       string | null;
  isOpen:         boolean;
  onClose:        () => void;
  onNewChat:      () => void;
  onSelect:       (id: string) => void;
  onDelete:       (id: string) => void;
  onRename:       (id: string, title: string) => void;
  onExport:       (id: string) => void;
  onClearAll:     () => void;
  onOpenSettings: () => void;
}

function ConversationItem({
  conversation, isActive, onSelect, onDelete, onRename, onExport,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (t: string) => void;
  onExport: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showMenu, setShowMenu]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [isEditing]);

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  const submit = useCallback(() => {
    const t = editTitle.trim();
    if (t && t !== conversation.title) onRename(t);
    else setEditTitle(conversation.title);
    setIsEditing(false);
  }, [editTitle, conversation.title, onRename]);

  return (
    <div
      onClick={() => !isEditing && onSelect()}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm cursor-pointer select-none',
        'transition-all duration-100',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:bg-white/5 hover:text-white',
      )}
    >
      <MessageSquare className="h-5 w-5 shrink-0 opacity-60" />

      {isEditing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={submit}
          onKeyDown={e => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') { setEditTitle(conversation.title); setIsEditing(false); }
          }}
          onClick={e => e.stopPropagation()}
          className="flex-1 min-w-0 bg-[#2a2a2a] rounded-lg px-2 py-0.5 text-white outline-none border border-white/30"
        />
      ) : (
        <span className="flex-1 min-w-0 truncate">{conversation.title}</span>
      )}

      {!isEditing && (
        <span className="shrink-0 text-xs text-gray-600 group-hover:hidden">
          {formatRelativeTime(conversation.updatedAt)}
        </span>
      )}

      {!isEditing && (
        <div
          className={cn('hidden group-hover:flex items-center gap-0.5', isActive && 'flex')}
          onClick={e => e.stopPropagation()}
        >
          <Tooltip content="Rename" side="top">
            <Button
              variant="ghost" size="xs"
              onClick={() => { setEditTitle(conversation.title); setIsEditing(true); }}
              className="h-7 w-7 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Tooltip>

          <div className="relative" ref={menuRef}>
            <Button variant="ghost" size="xs" onClick={() => setShowMenu(v => !v)} className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-[#2a2a2a] bg-[#111] p-1.5 shadow-2xl">
                <button
                  onClick={() => { onExport(); setShowMenu(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-4 w-4" /> Export
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="xs" onClick={submit} className="h-7 w-7 p-0 text-green-400">
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="xs"
            onClick={() => { setEditTitle(conversation.title); setIsEditing(false); }}
            className="h-7 w-7 p-0 text-gray-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  conversations, activeId, isOpen, onClose, onNewChat,
  onSelect, onDelete, onRename, onExport, onClearAll, onOpenSettings,
}: SidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const grouped    = groupByDate(filtered);
  const groupOrder = ['Today', 'Yesterday', 'This week', 'This month', 'Older'];

  return (
    <>
      {/* ── Backdrop: always covers full screen when open, click to close ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────────────── */}
      {/*   Always fixed-position. isOpen drives translate-x on ALL sizes. */}
      {/*   No lg: override so desktop burger toggle works too.            */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-72 flex-col',
          'bg-[#0a0a0a] border-r border-[#1e1e1e]',
          'transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FrancisAI</span>
          </div>
          {/* Close arrow — always visible inside the panel */}
          <Button variant="ghost" size="xs" onClick={onClose} className="h-8 w-8 p-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4 pb-2">
          <Button
            variant="primary" size="md" onClick={onNewChat}
            leftIcon={<Plus className="h-5 w-5" />}
            className="w-full justify-start text-sm"
          >
            New conversation
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-xl bg-[#1a1a1a] py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-600 outline-none border border-transparent focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-10 w-10 text-[#2a2a2a] mb-3" />
              <p className="text-sm text-gray-600">
                {search ? 'No results' : 'No conversations yet'}
              </p>
              {!search && <p className="text-xs text-gray-700 mt-1">Start a new chat</p>}
            </div>
          ) : (
            groupOrder.map(label => {
              const items = grouped[label];
              if (!items?.length) return null;
              return (
                <div key={label}>
                  <p className="px-2 mb-1.5 text-xs font-semibold text-gray-600 uppercase tracking-widest">
                    {label}
                  </p>
                  <div className="space-y-0.5">
                    {items.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv as Conversation}
                        isActive={conv.id === activeId}
                        onSelect={() => { onSelect(conv.id); onClose(); }}
                        onDelete={() => onDelete(conv.id)}
                        onRename={t => onRename(conv.id, t)}
                        onExport={() => onExport(conv.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e1e1e] p-3 space-y-1">
          <Button
            variant="ghost" size="sm" onClick={onOpenSettings}
            leftIcon={<Settings className="h-5 w-5" />}
            className="w-full justify-start text-gray-400 text-sm"
          >
            Settings
          </Button>
          {conversations.length > 0 && (
            <Button
              variant="danger" size="sm" onClick={onClearAll}
              leftIcon={<Trash2 className="h-5 w-5" />}
              className="w-full justify-start text-sm"
            >
              Clear all chats
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
