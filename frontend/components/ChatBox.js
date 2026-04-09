import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import Loader from "./Loader";
import { streamMessageToAI, fetchChatHistory, fetchPersonality } from "../utils/api";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function ChatBox({ currentSessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [therapyMode, setTherapyMode] = useState("cbt");
  const [personalityType, setPersonalityType] = useState("INFP");
  const [currentMood, setCurrentMood] = useState("Tranquil");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentMood(localStorage.getItem("currentMood") || "Tranquil");
    }
  }, []);

  const bottomRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      if (!currentSessionId) return;
      setIsFetchingHistory(true);
      try {
        const history = await fetchChatHistory(currentSessionId);
        if (history && history.length > 0) {
          setMessages(history.map(msg => ({ role: msg.role, text: msg.message })));
        } else {
          setMessages([{ role: "ai", text: `Hi, I'm here for you 💜 I see you're feeling ${currentMood.toLowerCase()} today. How can I support you?` }]);
        }

        const pers = await fetchPersonality();
        setTherapyMode(pers.therapyMode);
        setPersonalityType(pers.personality);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    loadData();
  }, [currentMood, currentSessionId]);

  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput("");
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const speakText = (text) => {
    if (!speechSynthesisEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Personality voice traits
    if (personalityType === "INTJ" || personalityType === "ISTJ") {
      utterance.pitch = 0.9;
      utterance.rate = 0.95;
    } else if (personalityType === "ENFP" || personalityType === "ESFP") {
      utterance.pitch = 1.3;
      utterance.rate = 1.1;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 0.95; // Default calm
    }

    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Samantha"));
    if (premiumVoice) utterance.voice = premiumVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTyping(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSessionId) return;
    abortControllerRef.current = new AbortController();

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
      { role: "ai", text: "" }
    ]);

    setIsTyping(true);
    let startedStreaming = false;

    let fullAiResponse = "";

    await streamMessageToAI(
      userMessage,
      currentSessionId,
      therapyMode,
      personalityType,
      (chunk) => {
        if (!startedStreaming) {
          setIsTyping(false);
          startedStreaming = true;
        }
        fullAiResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: newMessages[lastIndex].text + chunk
          };
          return newMessages;
        });
      },
      () => {
        setIsTyping(false);
        speakText(fullAiResponse);
      },
      abortControllerRef.current.signal
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isListening) toggleListening();
      sendMessage();
    }
  };

  if (isFetchingHistory) {
    return (
      <div className="h-full bg-[#030712] flex items-center justify-center">
        <Loader text="Loading conversation..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative" style={{background: "#030712"}}>
      
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-25 blob"
          style={{background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)"}} />
        <div className="absolute bottom-20 right-[-5%] w-80 h-80 rounded-full opacity-15 blob blob-delay"
          style={{background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)"}} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 py-3 flex items-center justify-between border-b"
        style={{background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)"}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 15px rgba(124,58,237,0.4)"}}>
            ✦
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm leading-none">AI Therapist</h2>
            <p className="text-xs mt-0.5" style={{color: "rgba(167,139,250,0.7)"}}>Always here to listen</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <span onClick={() => window.location.href = "/"} 
            className="cursor-pointer text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:scale-105"
            style={{background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)"}}>
            {currentMood}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
            style={{background: "rgba(124,58,237,0.12)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.2)"}}>
            {therapyMode}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg font-medium hidden sm:block"
            style={{background: "rgba(79,70,229,0.12)", color: "#a5b4fc", border: "1px solid rgba(79,70,229,0.2)"}}>
            {personalityType}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-hide pb-24">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} personalityType={personalityType} />
        ))}

        {isTyping && (
          <div className="flex gap-2 px-4 py-3 w-fit items-center rounded-2xl rounded-tl-sm border"
            style={{background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.2)"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: "0ms"}} />
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: "150ms"}} />
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: "300ms"}} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="relative z-20 p-4 border-t flex gap-2 items-end"
        style={{background: "rgba(3,7,18,0.9)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)"}}>
        
        <button 
          onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
          className="p-2.5 rounded-xl flex-shrink-0 transition-all"
          style={{
            background: speechSynthesisEnabled ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
            color: speechSynthesisEnabled ? "#c4b5fd" : "#475569",
            border: speechSynthesisEnabled ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)",
          }}>
          {speechSynthesisEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button 
          onClick={toggleListening}
          className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${isListening ? "animate-pulse" : ""}`}
          style={{
            background: isListening ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
            color: isListening ? "#f87171" : "#475569",
            border: isListening ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.06)",
          }}>
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening…" : "Share what's on your mind…"}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 resize-none overflow-hidden transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: "42px", maxHeight: "120px",
            outline: "none",
          }}
          rows={1}
        />

        {isTyping ? (
          <button
            onClick={handleStopGeneration}
            className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105"
            style={{background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => { if (isListening) toggleListening(); sendMessage(); }}
            disabled={!input.trim()}
            className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: input.trim() ? "0 0 20px rgba(124,58,237,0.4)" : "none",
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
