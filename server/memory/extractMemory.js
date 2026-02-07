export function extractMemory(text) {
  const memories = [];

  const patterns = [
    { regex: /my name is (.+)/i, map: m => `User's name is ${m[1]}` },
    { regex: /i like (.+)/i, map: m => `User likes ${m[1]}` },
    { regex: /i prefer (.+)/i, map: m => `User prefers ${m[1]}` },
    { regex: /i am learning (.+)/i, map: m => `User is learning ${m[1]}` },
    { regex: /i work as (.+)/i, map: m => `User works as ${m[1]}` },
  ];

  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match) memories.push(p.map(match));
  }

  return memories;
}
