import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function scoreMemory(text) {
  try {
    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content: `
  Analyze the user's message to extract ONLY highly important, long-term facts.
  - STORE: Name, profession, core preferences (e.g. "I only code in Python"), long-term goals.
  - IGNORE: Temporary states (e.g. "I am hungry"), small talk ("Hi", "Thanks"), simple questions ("What is RAG?"), or opinions about the chat ("You are smart"). or maths problem
  
  Return JSON:
  {
    "importance": number (0-1), // 0.9 for name/job, 0.1 for pleasantries
    "memory": string | null
  }
          `,
        },
        {
          role: "user",
          content: `
  Message:
  "${text}"
  
  Return JSON like:
  {
    "importance": number (0-1),
    "memory": string | null
  }
          `,
        },
      ],
    });

    const cleanJson = completion.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn("⚠️ Primary scoring failed, trying fallback...", error.message);
    
    // Fallback: Gemini Free
    const completion = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-lite-preview-02-05:free",
      messages: [
        {
          role: "system",
          content: "You are a memory extractor. Analyze the user message. Return JSON: { importance: number, memory: string | null }.",
        },
        { role: "user", content: text },
      ],
    });

    const cleanJson = completion.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      
    return JSON.parse(cleanJson);
  }
}
