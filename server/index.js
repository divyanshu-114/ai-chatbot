import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";
import pdf from "pdf-parse";

import { detectIntent } from "./utils/intent.js";
import { ragQuery } from "./rag/ragQuery.js";
import { webSearch } from "./web/webSearch.js";

// 🧠 MEMORY + CONTEXT IMPORTS
import { extractMemory } from "./memory/extractMemory.js";
import { processMemory } from "./memory/memoryPipeline.js";
import { addToContext, getContext } from "./memory/contextWindow.js";
import { retrieveMemory } from "./memory/retrieveMemory.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ===============================
// OpenRouter client
// ===============================
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,   
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "AI Chatbot",
  },
});

// ===============================
// Health check
// ===============================
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ===============================
// Chat endpoint
// ===============================
app.post("/chat", upload.single("file"), async (req, res) => {
  try {
    let { messages, sessionId = "default-session" } = req.body;

    if (typeof messages === "string") {
      messages = JSON.parse(messages);
    }

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be user" });
    }

    const userText = lastMessage.content;

    // ===============================
    // 🧠 MEMORY: Extract + Process via LLM importance
    // ===============================
    processMemory(userText).catch(console.error);

    // ===============================
    // 🧠 CONTEXT WINDOW
    // ===============================
    addToContext(sessionId, "user", userText);

    let extraContext = "";

    // ===============================
    // Process Memory (Store & Retrieve Fresh)
    // ===============================
    const freshMemory = await processMemory(userText);
    
    // ===============================
    // Inject Memory from RAG (long-term)
    // ===============================
    const memoryContext = await retrieveMemory(userText);
    if (memoryContext) {
      console.log("🧠 Retrieved Memory:", memoryContext);
      extraContext += `\n--- Long-term Memory ---\n${memoryContext}\n`;
    }

    if (freshMemory) {
      console.log("✨ Just Learned:", freshMemory);
      extraContext += `\n--- JUST LEARNED (Priority) ---\n${freshMemory}\n`;
    }

    // ===============================
    // File Upload
    // ===============================
    if (req.file) {
      try {
        let fileContent = "";
        if (req.file.mimetype === "application/pdf") {
          const data = await pdf(req.file.buffer);
          fileContent = data.text;
        } else {
          fileContent = req.file.buffer.toString("utf-8");
        }

        extraContext += `
--- Uploaded File (${req.file.originalname}) ---
${fileContent}
--- End File ---
`;
      } catch (e) {
        extraContext += `\n(File read error)\n`;
      }
    }

    // ===============================
    // RAG context
    // ===============================
    const intent = detectIntent(userText);
    if (intent === "PDF") {
      const ragCtx = await ragQuery(userText);
      if (ragCtx) extraContext += `\n--- RAG Context ---\n${ragCtx}\n`;
    }

    // ===============================
    // Web search context
    // ===============================
    if (intent === "WEB") {
      const webCtx = await webSearch(userText);
      if (webCtx) extraContext += `\n--- Web Search ---\n${webCtx}\n`;
    }

    // ===============================
    // Inject system context
    // ===============================
    let finalMessages = messages;
    if (extraContext.trim()) {
      finalMessages = [
        ...messages.slice(0, -1),
        {
          role: "system",
          content: `
You are a helpful, intelligent, and comprehensive AI assistant.
Answer the user's question in detail, using Markdown for clarity (headers, bullet points, bold text).
Integrate the provided context naturally into your response.
You have access to long-term memory. When answering, explicitly mention what you recall if it's relevant (e.g., "I remember you mentioned...").
If the context is not relevant, ignore it and answer fully from your general knowledge.
If there are conflicting facts, prioritize the most recent one. **TRUST [JUST LEARNED] FACTS ABOVE ALL ELSE.**

Context:
${extraContext}
          `,
        },
        lastMessage,
      ];
    }

    // ===============================
    // OpenRouter streaming response
    // ===============================
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const stream = await client.chat.completions.create({
        model: "openrouter/auto", // Auto-route to best available free/paid
        messages: finalMessages,
        stream: true,
        // Optional: Add a fallback list if supported, or handle in catch
      });

      for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) res.write(token);
      }
    } catch (apiError) {
      console.error("⚠️ Primary model failed, trying fallback...", apiError.message);
      
      // Fallback to a reliable free model
      const stream = await client.chat.completions.create({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: finalMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) res.write(token);
      }
    }

    addToContext(sessionId, "assistant", "RESPONSE_SENT"); 

    res.end();
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.write("⚠️ Error: " + (err.message || "Server error"));
    res.end();
  }
});

// ===============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
