import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900/40 md:flex">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-100" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[92%] md:max-w-[78%] ${
          isUser
            ? "rounded-3xl rounded-tr-lg bg-zinc-200 px-5 py-3.5 text-zinc-950 shadow-sm"
            : "rounded-3xl border border-white/10 bg-zinc-900/30 px-5 py-4 text-zinc-100 shadow-sm"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap text-[15px] leading-6">
            {message.content}
          </div>
        ) : (
          <div className="markdown-body text-[15px] leading-7">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, "")}
                      {...props}
                    />
                  ) : (
                    <code
                      className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[13px] text-zinc-100"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a: (props) => (
                  <a
                    {...props}
                    className="font-medium text-blue-400 underline underline-offset-4 hover:opacity-80"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                p: (props) => (
                  <p {...props} className="mb-3 last:mb-0 text-zinc-100" />
                ),
                ul: (props) => (
                  <ul
                    {...props}
                    className="mb-3 list-disc space-y-1 pl-5 text-zinc-100 marker:text-zinc-500"
                  />
                ),
                ol: (props) => (
                  <ol
                    {...props}
                    className="mb-3 list-decimal space-y-1 pl-5 text-zinc-100 marker:text-zinc-500"
                  />
                ),
                h1: (props) => (
                  <h1 {...props} className="mb-3 mt-5 text-xl font-semibold" />
                ),
                h2: (props) => (
                  <h2 {...props} className="mb-3 mt-5 text-lg font-semibold" />
                ),
                h3: (props) => (
                  <h3 {...props} className="mb-2 mt-4 text-base font-semibold" />
                ),
                blockquote: (props) => (
                  <blockquote
                    {...props}
                    className="my-3 border-l-2 border-white/10 pl-4 text-zinc-200"
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* User avatar spacer */}
      {isUser && <div className="hidden w-9 md:block" />}
    </motion.div>
  );
}

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
          <Terminal size={12} className="text-zinc-300" />
          <span className="opacity-90">{language}</span>
        </div>

        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.85rem",
          lineHeight: "1.6",
          background: "transparent",
        }}
        wrapLongLines={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}