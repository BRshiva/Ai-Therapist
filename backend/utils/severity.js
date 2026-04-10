export function detectSeverity(message) {
  const msg = message.toLowerCase();
  
  const highSeverity = ["suicide", "kill myself", "end it all", "don't want to live", "hopeless", "cutting", "self harm"];
  const mediumSeverity = ["depressed", "anxious", "panic attack", "can't cope", "struggling", "hard to breathe"];

  if (highSeverity.some(keyword => msg.includes(keyword))) {
    return "HIGH";
  }
  
  if (mediumSeverity.some(keyword => msg.includes(keyword))) {
    return "MEDIUM";
  }

  return "LOW";
}
