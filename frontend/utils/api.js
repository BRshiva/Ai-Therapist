import axios from "axios";

const BASE_URL = "https://ai-therapist-1-kndl.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

export const sendMessageToAI = async (message, therapyMode = "cbt", personalityType = "INFP") => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await API.post("/chat", {
      message,
      userId: user?.userId,
      personalityType,
      therapyMode,
      currentMood: localStorage.getItem("currentMood") || "Tranquil"
    });

    return res.data.reply;
  } catch (err) {
    console.error(err);
    return "Something went wrong.";
  }
};

export const streamMessageToAI = async (message, sessionId, therapyMode = "cbt", personalityType = "INFP", onChunk, onDone, signal) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId: user?.userId,
        sessionId,
        personalityType,
        therapyMode,
        currentMood: localStorage.getItem("currentMood") || "Tranquil"
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n\n");
      for (let line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") {
            if (onDone) onDone();
            return;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.text) {
              onChunk(data.text);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks if any
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    onChunk("Something went wrong with the connection.");
    if (onDone) onDone();
  }
};

// -- SESSION MANAGEMENT --

export const fetchSessions = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return [];
    const res = await API.get(`/sessions/${user.userId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const createSession = async (sessionName = "New Session") => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.userId) return null; // guard: don't call if not logged in
    const res = await API.post(`/sessions`, { userId: user.userId, sessionName });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const renameSession = async (sessionId, sessionName) => {
  try {
    const res = await API.put(`/sessions/${sessionId}/rename`, { sessionName });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    await API.delete(`/sessions/${sessionId}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const fetchChatHistory = async (sessionId) => {
  try {
    if (!sessionId) return [];
    const res = await API.get(`/chat/session/${sessionId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchJournals = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return [];
    const res = await API.get(`/journal/${user.userId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const saveJournal = async (text) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await API.post("/journal", { text, userId: user?.userId });
    return res.data.entry;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchProgress = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return null;
    const res = await API.get(`/progress/${user.userId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchPersonality = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return { personality: "INFP", therapyMode: "cbt" };
    const res = await API.get(`/personality/${user.userId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return { personality: "INFP", therapyMode: "cbt" };
  }
};

export const setPersonality = async (personality, therapyMode) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await API.post("/personality", {
          userId: user?.userId,
          personality,
          therapyMode
      });
      return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const fetchInsights = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return null;
    const res = await fetch(`${BASE_URL}/progress/insights/${user.userId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};