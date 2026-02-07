import crypto from "crypto";
import { parsePdf } from "./parsePdf.js";
import { chunkText } from "../utils/chunkText.js";
import { pinecone, index } from "../rag/pinecone.js";

export async function ingestPdf(path) {
  const text = await parsePdf(path);

  const chunks = chunkText(text, 500, 100);
  if (!chunks.length) throw new Error("No chunks");

  const embeddings = await pinecone.inference.embed({
    model: "multilingual-e5-large",
    inputs: chunks,
    parameters: { inputType: "passage", truncate: "END" },
  });

  const records = chunks.map((chunk, i) => ({
    id: crypto.randomUUID(),
    values: embeddings.data[i].values,
    metadata: { text: chunk, source: path },
  }));

  await index.upsert({ records });
}
