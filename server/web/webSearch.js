// import fetch from "node-fetch";

// export async function webSearch(query) {
//   const res = await fetch(
//     `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
//   );
//   const data = await res.json();
//   return data.AbstractText || "No web results found.";
// }



export async function webSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("Missing TAVILY_API_KEY in .env");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: true,
      include_raw_content: false,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Tavily error: ${res.status} ${txt}`);
  }

  const data = await res.json();

  // Compact context for the model
  const quick = data.answer ? `Quick answer: ${data.answer}\n\n` : "";

  const results = (data.results || []).slice(0, 5).map((r, i) => {
    return `Source ${i + 1}
Title: ${r.title}
URL: ${r.url}
Snippet: ${r.content}`;
  });

  return (quick + results.join("\n\n")).trim() || "No web results found.";
}