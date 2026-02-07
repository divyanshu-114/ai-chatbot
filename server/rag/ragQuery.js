import { pinecone, index } from "./pinecone.js";

export async function ragQuery(question) {
  const embeddings = await pinecone.inference.embed(
    {
      model: "multilingual-e5-large",
      inputs: [question],
      parameters: { inputType: "query" }
    }
  );
  
  const queryVector = embeddings.data[0].values;

  const result = await index.query({
    vector: queryVector,
    topK: 5,
    includeMetadata: true,
  });

  if (!result.matches || result.matches.length === 0) {
    return "";
  }

 return result.matches
  .filter(m => m.score > 0.75)
  .map(m => m.metadata.text)
  .join("\n\n");

}
