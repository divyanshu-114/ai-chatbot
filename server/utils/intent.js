export function detectIntent(message) {
    const text = message.toLowerCase();
  
    if (
      text.includes("pdf") ||
      text.includes("document") ||
      text.includes("file")
    ) {
      return "PDF";
    }
  
    if (
      text.includes("latest") ||
      text.includes("today") ||
      text.includes("news") ||
      text.includes("current")
    ) {
      return "WEB";
    }
  
    return "NORMAL";
  }
  