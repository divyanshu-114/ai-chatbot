import fs from "fs/promises";
import path from "path";
import { pinecone, index } from "../rag/pinecone.js";

const MEMORY_FILE = path.join(process.cwd(), "data", "memories.json");

// Ensure data directory exists
async function ensureFile() {
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    await fs.writeFile(MEMORY_FILE, "[]", "utf-8");
  }
}

export async function getMemories() {
  await ensureFile();
  const data = await fs.readFile(MEMORY_FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveMemory(memoryObj) {
  await ensureFile();
  const memories = await getMemories();
  memories.unshift(memoryObj); // Add new memory to top
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memories, null, 2));
}

export async function deleteMemory(id) {
  await ensureFile();
  let memories = await getMemories();
  const memoryToDelete = memories.find((m) => m.id === id);
  
  if (!memoryToDelete) return;

  // 1. Remove from local JSON
  memories = memories.filter((m) => m.id !== id);
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memories, null, 2));

  // 2. Remove from Pinecone
  try {
    await index.deleteOne(id, { namespace: "memory" }); // Delete specific ID from namespace
    console.log(`🗑️ Deleted memory ${id} from Pinecone`);
  } catch (err) {
    console.error("⚠️ Failed to delete from Pinecone:", err.message);
  }
}
