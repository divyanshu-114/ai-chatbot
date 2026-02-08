import { saveMemory } from "./memoryManager.js";
import crypto from "crypto";
import { pinecone, index } from "../rag/pinecone.js";

async function isDuplicateMemory(embedding) {
  const result = await index.query({
    namespace: "memory",
    topK: 5,
    vector: embedding,
    filter: { type: "memory", userId: "default-user" },
  });

  return result.matches?.some(match => match.score > 0.92);
}

export async function storeMemory(memories) {
  if (!memories.length) return;

  // 1️⃣ Generate embeddings
  const embeddings = await pinecone.inference.embed({
    model: "multilingual-e5-large",
    inputs: memories,
    parameters: { inputType: "passage" },
  });

  const records = [];

  for (let i = 0; i < memories.length; i++) {
    const embedding = embeddings.data[i].values;
    const dup = await isDuplicateMemory(embedding);
    if (dup) continue;

    const id = crypto.randomUUID();
    const memoryData = {
      id,
      text: memories[i],
      userId: "default-user",
      type: "memory",
      createdAt: new Date().toISOString(),
    };

    records.push({
      id,
      values: embedding,
      metadata: memoryData,
    });

    // Sync to local JSON
    await saveMemory(memoryData);
  }

  if (records.length) {
    await index.upsert({ records, namespace: "memory" });
  }
}
