import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import { streamMessageToAI } from "../utils/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const FEELINGS = [
  { emoji: "😔", label: "Down", value: 1 },
  { emoji: "😊", label: "Content", value: 2 },
  { emoji: "😌", label: "Peaceful", value: 3 },
  { emoji: "🤗", label: "Happy", value: 4 },
  { emoji: "✨", label: "Excited", value: 5 },
];

export default function ChatBox() {
  const starterMessage = useMemo(() => ({ role: "ai", text: "Hi, I'm here for you 💜" }), []);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [messages, setMessages] = useState([starterMessage]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [isDark, setIsDark] = useState(false);
  const [mood, setMood] = useState(3);
  const [isMoodOpen, setIsMoodOpen] = useState(false);

  const bottomRef = useRef(null);
  const userIdRef = useRef("guest");
  const abortRef = useRef(null);

  const [renamingSessionId, setRenamingSessionId] = useState("");
  const [renameDraft, setRenameDraft] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionStorageKey = () => `chatSessions:${userIdRef.current}`;
  const currentSession = sessions.find((session) => session.id === activeSessionId);

  const lastAiText = useMemo(() => {
    const list = isStreaming ? [...messages, { role: "ai", text: streamingText }] : messages;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i]?.role === "ai" && list[i]?.text) return list[i].text;
    }
    return "";
  }, [messages, isStreaming, streamingText]);

  const messagePreview = (text = "") =>
    text.length > 36 ? `${text.slice(0, 36)}...` : text;

  const personalityVoice = (personalityType = "INFP") => {
    const p = String(personalityType || "INFP").toUpperCase();
    const map = {
      INFP: { rate: 1.02, pitch: 1.12 },
      INFJ: { rate: 0.98, pitch: 0.98 },
      ENFP: { rate: 1.05, pitch: 1.18 },
      INTJ: { rate: 0.92, pitch: 0.95 },
      ISFP: { rate: 1.0, pitch: 1.05 },
      ISTP: { rate: 0.95, pitch: 0.98 },
      ENFJ: { rate: 1.02, pitch: 1.06 },
      ENTJ: { rate: 0.94, pitch: 0.96 },
      ESTJ: { rate: 0.93, pitch: 0.92 },
      ESFJ: { rate: 1.0, pitch: 1.03 },
    };
    return map[p] || map.INFP;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userIdRef.current = user?.uid || "guest";
    setIsDark(localStorage.getItem("theme") === "dark");
    const storedMood = Number(localStorage.getItem("currentMood") || "3");
    if (storedMood >= 1 && storedMood <= 5) setMood(storedMood);

    const saved = JSON.parse(localStorage.getItem(sessionStorageKey()) || "[]");
    if (saved.length) {
      setSessions(saved);
      setActiveSessionId(saved[0].id);
      setMessages(saved[0].messages);
    } else {
      const initialSession = {
        id: `${Date.now()}`,
        title: "New reflection",
        updatedAt: Date.now(),
        messages: [starterMessage],
      };
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
      setMessages(initialSession.messages);
    }

    // If logged-in, prefer MongoDB sessions over localStorage.
    if (userIdRef.current !== "guest") {
      axios
        .get(`${API_BASE}/chat/sessions`, { params: { userId: userIdRef.current } })
        .then((res) => {
          const serverSessions = res?.data?.sessions || [];
          if (!serverSessions.length) return;

          const normalized = serverSessions.map((s) => ({
            id: s.id,
            title: s.title,
            updatedAt: new Date(s.updatedAt).getTime?.() || Date.now(),
            messages: (s.messages || []).map((m) => ({ role: m.role, text: m.text })),
          }));

          setSessions(normalized);
          setActiveSessionId(normalized[0].id);
          setMessages(normalized[0].messages);
        })
        .catch(() => {
          // Fallback to localStorage on failure.
        });
    }
  }, [starterMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isStreaming]);

  useEffect(() => {
    if (!sessions.length) return;
    localStorage.setItem(sessionStorageKey(), JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (!activeSessionId || !sessions.length) return;
    const active = sessions.find((session) => session.id === activeSessionId);
    if (active) setMessages(active.messages);
  }, [activeSessionId, sessions]);

  useEffect(() => {
    const onThemeChange = (event) => setIsDark(Boolean(event.detail?.dark));
    window.addEventListener("theme-change", onThemeChange);
    return () => window.removeEventListener("theme-change", onThemeChange);
  }, []);

  const updateSession = (sessionId, nextMessages) => {
    setSessions((prev) =>
      prev
        .map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: nextMessages,
                updatedAt: Date.now(),
                title:
                  session.title === "New reflection"
                    ? messagePreview(nextMessages.find((m) => m.role === "user")?.text || "New reflection")
                    : session.title,
              }
            : session
        )
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  };

  const createNewSession = () => {
    const next = {
      id: `${Date.now()}`,
      title: "New reflection",
      updatedAt: Date.now(),
      messages: [starterMessage],
    };
    setSessions((prev) => [next, ...prev]);
    setActiveSessionId(next.id);
    setMessages(next.messages);
    setInput("");
    setStreamingText("");
    setIsTyping(false);
    setIsStreaming(false);
  };

  const cancelStreaming = () => {
    try {
      abortRef.current?.abort();
    } catch {
      // ignore
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || isStreaming) return;
    const currentSessionId = activeSessionId || sessions[0]?.id;
    if (!currentSessionId) return;

    const userMessage = input.trim();
    const userMessages = [...messages, { role: "user", text: userMessage }];

    setMessages(userMessages);
    updateSession(currentSessionId, userMessages);
    setInput("");

    abortRef.current = new AbortController();

    let aiText = "";
    setIsTyping(true);
    setIsStreaming(true);
    setStreamingText("");

    await streamMessageToAI(userMessage, {
      sessionId: currentSessionId,
      signal: abortRef.current.signal,
      currentMood: mood,
      onChunk: (chunk) => {
        aiText += chunk;
        setStreamingText(aiText);
      },
      onDone: () => {
        const finalMessages = [...userMessages, { role: "ai", text: aiText || "I'm listening. Please continue." }];
        setMessages(finalMessages);
        updateSession(currentSessionId, finalMessages);
        setStreamingText("");
        setIsStreaming(false);
        setIsTyping(false);
      },
      onError: (errorMessage) => {
        if (errorMessage === "Cancelled.") {
          // Keep conversation intact; don't append fallback AI text.
          setStreamingText("");
          setIsStreaming(false);
          setIsTyping(false);
          return;
        }

        const fallback = errorMessage || "Something went wrong.";
        const finalMessages = [...userMessages, { role: "ai", text: fallback }];
        setMessages(finalMessages);
        updateSession(currentSessionId, finalMessages);
        setStreamingText("");
        setIsStreaming(false);
        setIsTyping(false);
      },
    });
  };

  const moodChip = useMemo(() => {
    const closest =
      FEELINGS.reduce(
        (best, f) =>
          Math.abs(f.value - mood) < Math.abs(best.value - mood) ? f : best,
        FEELINGS[2]
      ) || FEELINGS[2];
    return closest;
  }, [mood]);

  const setMoodAndPersist = (next) => {
    setMood(next);
    localStorage.setItem("currentMood", String(next));
  };

  const renameSession = async (sessionId, title) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.uid;
    if (userId) {
      try {
        await axios.put(`${API_BASE}/chat/sessions/rename`, { userId, sessionId, title });
      } catch {
        // ignore; local rename is still applied
      }
    }

    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s)));
  };

  const deleteSession = async (sessionId) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.uid;
    if (userId) {
      try {
        await axios.delete(`${API_BASE}/chat/sessions/${sessionId}`, { params: { userId } });
      } catch {
        // ignore; local deletion is still applied
      }
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      const next = remaining[0] || {
        id: `${Date.now()}`,
        title: "New reflection",
        updatedAt: Date.now(),
        messages: [starterMessage],
      };
      setActiveSessionId(next.id);
      setMessages(next.messages);
      if (!remaining.length) setSessions([next]);
    }
  };

  const startSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const speakLastAi = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (!lastAiText) return;

    const personality = localStorage.getItem("personality") || "INFP";
    const { rate, pitch } = personalityVoice(personality);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(lastAiText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <aside
        className={`w-72 rounded-2xl border p-3 backdrop-blur-xl ${
          isDark ? "bg-slate-900/60 border-slate-700" : "bg-white/40 border-white/40"
        }`}
      >
        <button
          onClick={createNewSession}
          className="w-full mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
        >
          + New chat
        </button>

        <div className="space-y-2 max-h-[75vh] overflow-y-auto">
          {sessions.map((session) => (
            <div key={session.id} className="group flex items-center gap-2">
              {renamingSessionId === session.id ? (
                <input
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setRenamingSessionId("");
                      renameSession(session.id, renameDraft.trim() || "New reflection");
                    }
                    if (e.key === "Escape") setRenamingSessionId("");
                  }}
                  className={`flex-1 px-2 py-1 rounded-lg text-sm border ${
                    isDark ? "bg-slate-800 text-slate-100 border-slate-600" : "bg-white border-slate-200"
                  }`}
                />
              ) : (
                <button
                  onClick={() => setActiveSessionId(session.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-xl text-sm transition ${
                    session.id === activeSessionId
                      ? "bg-violet-500 text-white"
                      : isDark
                        ? "bg-slate-800/70 text-slate-200"
                        : "bg-white/70 text-slate-700"
                  }`}
                >
                  {session.title}
                </button>
              )}

              {renamingSessionId !== session.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setRenamingSessionId(session.id);
                      setRenameDraft(session.title);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs ${
                      isDark ? "bg-slate-800 text-slate-200" : "bg-white/60 text-slate-700"
                    }`}
                    aria-label="Rename session"
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this chat session?")) deleteSession(session.id);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs ${
                      isDark ? "bg-slate-800 text-slate-200" : "bg-white/60 text-slate-700"
                    }`}
                    aria-label="Delete session"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col rounded-2xl border overflow-hidden ${
          isDark ? "bg-slate-900/50 border-slate-700" : "bg-white/20 border-white/40"
        }`}
      >
        <div
          className={`px-4 py-2 text-xs ${
            isDark ? "text-slate-300 bg-slate-800/70" : "text-slate-600 bg-white/40"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>Session: {currentSession?.title || "New reflection"}</div>
            <div className="relative">
              <button
                onClick={() => setIsMoodOpen((v) => !v)}
                className={`px-3 py-1 rounded-full border text-xs ${
                  isDark
                    ? "bg-slate-900/40 border-slate-700 text-slate-200"
                    : "bg-white/60 border-white/60 text-slate-700"
                }`}
                title="Set today's mood"
              >
                Today: {moodChip.emoji} {moodChip.label}
              </button>

              {isMoodOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-xl backdrop-blur-xl ${
                    isDark
                      ? "bg-slate-900/90 border-slate-700"
                      : "bg-white/80 border-white/60"
                  }`}
                >
                  <p className="text-[11px] px-2 py-1 text-slate-500 dark:text-slate-300">
                    Quick mood update
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {FEELINGS.map((f) => {
                      const active = f.value === mood;
                      return (
                        <button
                          key={f.label}
                          onClick={() => {
                            setMoodAndPersist(f.value);
                            setIsMoodOpen(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                            active
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                              : isDark
                                ? "bg-slate-800/80 text-slate-200"
                                : "bg-white/70 text-slate-700"
                          }`}
                        >
                          <span className="text-lg">{f.emoji}</span>
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-2 pt-2 pb-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300 mb-1">
                      <span>Slide</span>
                      <span className="font-medium">{mood}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={mood}
                      onChange={(e) => setMoodAndPersist(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} text={msg.text} />
          ))}

          {isTyping && (
            <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-white/60 px-3 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-violet-300 animate-bounce [animation-delay:120ms]"></span>
              <span className="w-2 h-2 rounded-full bg-violet-200 animate-bounce [animation-delay:240ms]"></span>
              <span className="ml-1">AI is thinking...</span>
            </div>
          )}

          {isStreaming && <MessageBubble role="ai" text={streamingText} />}

          <div ref={bottomRef}></div>
        </div>

        <div
          className={`p-3 backdrop-blur-xl flex gap-2 sticky bottom-0 border-t ${
            isDark ? "bg-slate-900/70 border-slate-700" : "bg-white/60 border-white/30"
          }`}
        >
          <button
            onClick={startSpeechToText}
            disabled={isListening || isStreaming}
            className={`px-3 py-3 rounded-xl border ${
              isDark ? "bg-slate-800 text-slate-200 border-slate-600" : "bg-white/70 text-slate-700 border-slate-200"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
            title="Speech to text"
          >
            🎙
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Share what's on your mind..."
            className={`flex-1 p-3 rounded-xl border ${
              isDark ? "bg-slate-800 text-slate-100 border-slate-600" : "bg-white border-slate-200"
            }`}
          />

          {isStreaming ? (
            <button
              onClick={cancelStreaming}
              className="px-3 py-3 rounded-xl bg-rose-500 text-white"
              title="Cancel generation"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={isTyping || isStreaming || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
              title="Send"
            >
              ➤
            </button>
          )}

          <button
            onClick={speakLastAi}
            disabled={isStreaming || !lastAiText || isSpeaking}
            className={`px-3 py-3 rounded-xl border ${
              isDark ? "bg-slate-800 text-slate-200 border-slate-600" : "bg-white/70 text-slate-700 border-slate-200"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
            title="Read last therapist reply"
          >
            🔊
          </button>

          <button
            onClick={stopSpeak}
            disabled={!isSpeaking}
            className={`px-3 py-3 rounded-xl border ${
              isDark ? "bg-slate-800 text-slate-200 border-slate-600" : "bg-white/70 text-slate-700 border-slate-200"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
            title="Stop speaking"
          >
            ■
          </button>
        </div>
      </div>
    </div>
  );
}

