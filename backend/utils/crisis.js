export function detectCrisis(message) {
  const msg = message.toLowerCase();
  const crisisKeywords = ["suicide", "kill myself", "want to die", "end my life", "overdose", "hurt myself"];
  return crisisKeywords.some(keyword => msg.includes(keyword));
}

export function getCrisisResponse() {
  return "I'm very concerned about what you're sharing. If you are in immediate danger, please reach out for professional help or call a crisis hotline (like 988 in the US). You don't have to go through this alone.";
}
