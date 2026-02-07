import { scoreMemory } from "./scoreMemory.js";
import { storeMemory } from "./storeMemory.js";
import { extractMemory } from "./extractMemory.js";

export async function processMemory(message) {
  // 1️⃣ Fast Path: Regex Extraction (Free & Fast)
  const explicitMemories = extractMemory(message);
  if (explicitMemories.length > 0) {
    console.log("⚡️ Regex Memory Extracted:", explicitMemories);
    await storeMemory(explicitMemories);
    return explicitMemories.join("; "); // Return memories for immediate use
  }

  // 2️⃣ Slow Path: LLM Scoring (Only if regex missed)
  try {
    const { importance, memory } = await scoreMemory(message);
    if (importance >= 0.8 && memory) {
      console.log("🧠 LLM Memory Extracted:", memory);
      await storeMemory([memory]);
      return memory; // Return memory for immediate use
    }
  } catch (error) {
    console.warn("⚠️ Memory scoring skipped (Rate Limit/Error):", error.message);
  }

  return null;
}
