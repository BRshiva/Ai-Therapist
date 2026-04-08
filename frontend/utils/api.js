import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
});

export const sendMessageToAI = async (message, sessionId = "") => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const personality = localStorage.getItem("personality") || "INFP";
    const currentMood = Number(localStorage.getItem("currentMood") || "0") || 0;

    const res = await API.post("/chat", {
      message,
      userId: user?.uid, // ✅ real user id (no guest fallback)
      personalityType: personality,
      sessionId,
      currentMood,
    });

    return res.data.reply;
  } catch (err) {
    console.error(err);
    return "Something went wrong.";
  }
};

export const streamMessageToAI = async (message, handlers = {}) => {
  const { onChunk, onDone, onError, signal, sessionId = "", currentMood = null } = handlers;
  const user = JSON.parse(localStorage.getItem("user"));
  const personality = localStorage.getItem("personality") || "INFP";

  try {
    const response = await fetch(`${API.defaults.baseURL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId: user?.uid,
        personalityType: personality,
        sessionId,
        currentMood: currentMood ?? (Number(localStorage.getItem("currentMood") || "0") || 0),
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error("Streaming not available");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const line = event
          .split("\n")
          .find((entry) => entry.startsWith("data: "));
        if (!line) continue;

        const payload = JSON.parse(line.replace("data: ", ""));

        if (payload.type === "chunk" && onChunk) onChunk(payload.content);
        if (payload.type === "done" && onDone) onDone(payload);
        if (payload.type === "error" && onError) onError(payload.message);
      }
    }
  } catch (error) {
    console.error(error);
    if (error?.name === "AbortError") {
      if (onError) onError("Cancelled.");
      return;
    }
    if (onError) onError("Something went wrong.");
  }
};