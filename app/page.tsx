'use client';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Sidebar }       from '@/components/layout/Sidebar';
import { ChatHeader }    from '@/components/chat/ChatHeader';
import { ChatWindow }    from '@/components/chat/ChatWindow';
import { ChatInput }     from '@/components/chat/ChatInput';
import { SettingsPanel } from '@/components/chat/SettingsPanel';
import { ErrorBanner }   from '@/components/ui/ErrorBanner';
import { useConversations } from '@/hooks/useConversations';
import { useSettings }      from '@/hooks/useSettings';
import { useChat }          from '@/hooks/useChat';
import { DEFAULT_MODEL }    from '@/lib/constants';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations, activeConversation, activeId,
    createConversation, selectConversation, deleteConversation,
    renameConversation, clearAll, addMessage, updateMessage,
    updateConversationModel, exportConversation, exportAll,
  } = useConversations();

  const {
    settings, updateSettings, resetToDefaults,
    isSettingsOpen, openSettings, closeSettings,
  } = useSettings();

  const { isLoading, error, sendMessage, stopGeneration, clearError } = useChat({
    conversationId:  activeId,
    model:           activeConversation?.model ?? DEFAULT_MODEL,
    settings,
    messages:        activeConversation?.messages ?? [],
    onAddMessage:    addMessage,
    onUpdateMessage: updateMessage,
  });

  // ── New chat ─────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    createConversation(DEFAULT_MODEL);
    setSidebarOpen(false);
  }, [createConversation]);

  // ── Send message — create conversation on demand ─────────
  const handleSendMessage = useCallback(async (content: string) => {
    let convId = activeId;
    if (!convId) {
      // No active conversation — create one now, just before sending.
      // We pass convId directly into sendMessage because React won't
      // re-render (and update conversationId inside useChat) until after
      // this async function returns, so sendMessage would still see null.
      const newConv = createConversation(DEFAULT_MODEL);
      convId = newConv.id;
    }
    await sendMessage(content, convId); // ← pass convId as override
  }, [activeId, createConversation, sendMessage]);

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    deleteConversation(id);
    toast.success('Conversation deleted');
  }, [deleteConversation]);

  // ── Clear all — NO auto-create afterward ─────────────────
  const handleClearAll = useCallback(() => {
    clearAll();
    setSidebarOpen(false);
    toast.success('All conversations cleared');
  }, [clearAll]);

  // ── Export ───────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (activeId) { exportConversation(activeId); toast.success('Exported!'); }
  }, [activeId, exportConversation]);

  const handleExportAll = useCallback(() => {
    exportAll();
    toast.success('All conversations exported');
  }, [exportAll]);

  // ── Streaming toggle ─────────────────────────────────────
  const handleToggleStreaming = useCallback(() => {
    updateSettings({ streamingEnabled: !settings.streamingEnabled });
    toast.success(settings.streamingEnabled ? 'Streaming disabled' : 'Streaming enabled');
  }, [settings.streamingEnabled, updateSettings]);

  return (
    <div className="flex h-full overflow-hidden bg-black">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelect={id => { selectConversation(id); setSidebarOpen(false); }}
        onDelete={handleDelete}
        onRename={renameConversation}
        onExport={exportConversation}
        onClearAll={handleClearAll}
        onOpenSettings={openSettings}
      />

      <main className="flex flex-1 flex-col overflow-hidden min-w-0 bg-[#050505]">
        <ChatHeader
          conversation={activeConversation}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onModelChange={id => {
            if (activeId) { updateConversationModel(activeId, id); toast.success('Model updated'); }
          }}
          onExport={handleExport}
          streamingEnabled={settings.streamingEnabled}
          onToggleStreaming={handleToggleStreaming}
        />

        <ChatWindow
          messages={activeConversation?.messages ?? []}
          isLoading={isLoading}
          onSuggestion={handleSendMessage}
        />

        {error && (
          <div className="px-4">
            <ErrorBanner message={error} onDismiss={clearError} />
          </div>
        )}

        <div className="border-t border-[#1a1a1a] bg-[#050505] px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSubmit={handleSendMessage}
              onStop={stopGeneration}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </div>
        </div>
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={() => { resetToDefaults(); toast.success('Settings reset'); }}
        onExportAll={handleExportAll}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
