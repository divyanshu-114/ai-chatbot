import { X, Plus, MessageSquare, Trash2, Brain, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, setIsOpen, newChat }) {
    const [showMemory, setShowMemory] = useState(false);
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = `${import.meta.env.VITE_API_URL}`;

    const fetchMemories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/memories`);
            const data = await res.json();
            setMemories(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch memories", e);
        } finally {
            setLoading(false);
        }
    };

    const deleteMemory = async (id) => {
        try {
            await fetch(`${API_URL}/memories/${id}`, { method: "DELETE" });
            setMemories(prev => prev.filter(m => m.id !== id));
        } catch (e) {
            console.error("Failed to delete memory", e);
        }
    };

    useEffect(() => {
        if (showMemory) {
            fetchMemories();
        }
    }, [showMemory]);

    return (
        <>
            {/* Overlay (mobile) */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
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
                <div className="px-3 pb-3 flex-1 overflow-y-auto">
                    {showMemory ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-sm font-semibold text-zinc-400">Memory Bank</h3>
                                <button onClick={() => setShowMemory(false)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-zinc-600" size={20} /></div>
                            ) : memories.length === 0 ? (
                                <p className="text-center text-xs text-zinc-600 py-4">No long-term memories yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {memories.map((m) => (
                                        <div key={m.id} className="group relative rounded-lg border border-white/5 bg-white/5 p-3 hover:bg-white/10">
                                            <p className="text-xs text-zinc-300 pr-6">{m.text}</p>
                                            <p className="mt-1 text-[10px] text-zinc-500">{new Date(m.createdAt).toLocaleDateString()}</p>
                                            <button
                                                onClick={() => deleteMemory(m.id)}
                                                className="absolute right-2 top-2 hidden text-red-400 hover:text-red-300 group-hover:block"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                Chats
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
                                    <MessageSquare size={16} className="opacity-70" />
                                    <span className="truncate">Current chat</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-auto px-3 pb-4 space-y-2">
                    {!showMemory && (
                        <button
                            onClick={() => setShowMemory(true)}
                            className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20"
                        >
                            <Brain size={16} />
                            Manage Memory
                        </button>
                    )}

                    <button
                        onClick={newChat}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                        title="Clear current chat"
                    >
                        <Trash2 size={16} />
                        Clear chat
                    </button>
                </div>
            </aside>
        </>
    );
}