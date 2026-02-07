import { useEffect, useRef, useState } from "react";
import {
  Send,
  Menu,
  Loader2,
  StopCircle,
  Paperclip,
  X,
  FileText,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import { Message } from "./components/Message";

const API_URL = `${import.meta.env.VITE_API_URL}/chat`;
const STORAGE_KEY = "ai_chat_messages_v2";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const newChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setFile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSuggestion = (prompt) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (textOverride) => {
    const text = textOverride || input.trim();
    if ((!text && !file) || isStreaming) return;

    // Optimistic UI update
    let userContent = text;
    if (file) {
      userContent = `${file.name ? `[File: ${file.name}]\n` : ""}${text}`;
    }

    const nextMessages = [...messages, { role: "user", content: userContent }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsStreaming(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(nextMessages));
      if (file) formData.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistantText += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Stream stopped by user");
      } else {
        console.error(error);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              prev[prev.length - 1].content +
              "\n\n⚠️ Error. Please check your connection.",
          };
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasMessages = messages.length > 0;
  return (

    <div className="h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="flex h-full w-full">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          newChat={newChat}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Mobile header (ChatGPT-ish) */}
          <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-zinc-950/70 px-4 py-3 backdrop-blur">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-300 hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-1 items-center justify-center">
              <span className="text-sm font-semibold text-zinc-200">
                New chat
              </span>
            </div>
            <div className="w-10" />
          </header>

          {/* Main area */}
          <main className="flex-1 overflow-y-auto">
            {!hasMessages ? (
              <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-24">
                <WelcomeScreen onSuggestionClick={handleSuggestion} />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl px-4 pb-44 pt-6 md:pt-10">
                {messages.map((m, i) => (
                  <div key={i} className="py-3 md:py-4">
                    <Message message={m} />
                  </div>
                ))}
                <div ref={bottomRef} className="h-24" />
              </div>
            )}
          </main>

          {/* Composer */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30">
            {/* Fade */}
            <div className="h-16 bg-gradient-to-t from-zinc-950 to-transparent" />

            <div className="pointer-events-auto px-4 pb-4">
              <div className="mx-auto w-full max-w-3xl">
                {/* Stop generating */}
                {isStreaming && (
                  <div className="mb-3 flex justify-center">
                    <button
                      onClick={stopStreaming}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-900"
                    >
                      <StopCircle size={16} />
                      Stop generating
                    </button>
                  </div>
                )}

                {/* File preview */}
                {file && (
                  <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-3 backdrop-blur">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <FileText size={18} className="text-zinc-200" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-zinc-100">
                        {file.name}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="rounded-full p-2 text-zinc-300 hover:bg-white/10"
                      aria-label="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Input pill */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/40 shadow-sm backdrop-blur">
                  <div className="flex items-end gap-2 px-3 py-3">
                    {/* File input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.txt,.md,.js,.py,.html,.css"
                    />

                    {/* Plus / attach */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-300 hover:bg-white/10"
                      title="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything"
                      rows={1}
                      className="max-h-[200px] w-full resize-none border-0 bg-transparent px-1 py-2 text-[15px] leading-6 text-zinc-100 placeholder:text-zinc-500 focus:ring-0"
                      style={{ minHeight: "24px" }}
                    />

                    {/* Send */}
                    <button
                      onClick={() => sendMessage()}
                      disabled={(!input.trim() && !file) || isStreaming}
                      className={`mb-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-all
                        ${(input.trim() || file) && !isStreaming
                          ? "bg-zinc-200 text-zinc-950 hover:bg-white"
                          : "text-zinc-600"
                        }`}
                      aria-label="Send"
                    >
                      {isStreaming ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>

                  <div className="px-4 pb-3 text-center text-[11px] text-zinc-500">
                    Enter to send • Shift+Enter for new line
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Composer */}
        </div>
      </div>
    </div>
  );
}