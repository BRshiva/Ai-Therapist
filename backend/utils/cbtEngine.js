export function analyzeThought(message) {
  const msg = message.toLowerCase();
  
  const distortions = [
    {
      type: "All-or-Nothing Thinking",
      keywords: ["always", "never", "completely", "perfect"],
      response: "Are things really that absolute, or is there a middle ground?"
    },
    {
      type: "Catastrophizing",
      keywords: ["horrible", "awful", "terrible", "end of the world"],
      response: "Even if the worst happened, would you be able to handle it?"
    },
    {
      type: "Overgeneralization",
      keywords: ["everyone", "no one", "everything", "nothing"],
      response: "One negative event doesn't mean a pattern will repeat forever."
    }
  ];

  for (const distortion of distortions) {
    if (distortion.keywords.some(keyword => msg.includes(keyword))) {
      return {
        distortion: distortion.type,
        response: distortion.response
      };
    }
  }

  return {
    distortion: "None detected",
    response: "That's a valid thought. Let's explore it more."
  };
}
