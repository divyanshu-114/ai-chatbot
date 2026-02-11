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

    if (
      text.includes("who is") ||
      text.includes("what is") ||
      text.includes("when is") ||
      text.includes("where is") ||
      text.includes("latest") ||
      text.includes("current") ||
      text.includes("today") ||
      text.includes("news")
    ) {
      return "WEB";
    }
  
    return "NORMAL";
  }
  