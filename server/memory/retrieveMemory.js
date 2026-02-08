import { pinecone, index } from "../rag/pinecone.js";

export async function retrieveMemory(query, userId = "default") {
  const embedding = await pinecone.inference.embed({
    model: "multilingual-e5-large",
    inputs: [query],
    parameters: { inputType: "query" },
  });

  const result = await index.query({
    vector: embedding.data[0].values,
    topK: 10,
    namespace: "memory",
    includeMetadata: true,
  });

  const matches = result.matches || [];

  // Sort by date (newest first). Missing date = 0 (Ancient)
  matches.sort((a, b) => {
    const dateA = a.metadata.createdAt ? new Date(a.metadata.createdAt).getTime() : 0;
    const dateB = b.metadata.createdAt ? new Date(b.metadata.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return matches
    .filter(m => m.score > 0.75)
    .map(m => {
      const date = m.metadata.createdAt ? new Date(m.metadata.createdAt).toLocaleString() : "Unknown Date";
      return `[${date}] ${m.metadata.text}`;
    })
    .join("\n");
}
