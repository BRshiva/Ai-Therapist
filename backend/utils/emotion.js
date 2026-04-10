export function detectEmotion(message) {
  const msg = message.toLowerCase();
  
  const emotions = {
    sad: ["sad", "unhappy", "cry", "miserable", "depressed", "lonely", "hopeless"],
    anxious: ["anxious", "worried", "nervous", "panic", "scared", "fear", "stress"],
    angry: ["angry", "mad", "annoyed", "frustrated", "hate"],
    happy: ["happy", "glad", "good", "great", "excited", "happy"],
    tired: ["tired", "exhausted", "sleepy", "burnout"]
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => msg.includes(keyword))) {
      return emotion;
    }
  }

  return "neutral";
}
