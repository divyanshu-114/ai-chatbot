import { X, Plus, MessageSquare, Trash2 } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen, newChat }) {
  return (
    <>
      {/* Overlay (mobile) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col border-r border-white/10 bg-zinc-950 transition-transform md:static md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <button
            onClick={newChat}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            <Plus size={16} />
            New chat
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 rounded-xl p-2 text-zinc-300 hover:bg-white/10 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chats */}
        <div className="px-3 pb-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Chats
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
              <MessageSquare size={16} className="opacity-70" />
              <span className="truncate">Current chat</span>
            </div>
          </div>
        </div>

        <div className="mt-auto px-3 pb-4">
          <button
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            title="Clear current chat"
          >
            <Trash2 size={16} />
            Clear chat
          </button>

          <div className="mt-3 text-center text-[11px] text-zinc-500">
            UI-only sidebar • logic unchanged
          </div>
        </div>
      </aside>
    </>
  );
}