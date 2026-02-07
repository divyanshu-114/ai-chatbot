export function chunkText(text, maxWords = 400, overlapWords = 100) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];

  let current = [];

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);

    if (current.length + words.length > maxWords) {
      chunks.push(current.join(" "));
      current = current.slice(-overlapWords);
    }

    current.push(...words);
  }

  if (current.length) {
    chunks.push(current.join(" "));
  }

  return chunks;
}
