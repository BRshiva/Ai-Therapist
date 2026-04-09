import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Head from "next/head";

const moods = [
  { id: "terrible", label: "Heavy", icon: "⛈️", color: "from-slate-700 to-slate-900", glow: "bg-slate-600" },
  { id: "sad", label: "Melancholic", icon: "🌧️", color: "from-blue-600 to-indigo-800", glow: "bg-blue-500" },
  { id: "anxious", label: "Restless", icon: "🌪️", color: "from-amber-500 to-orange-700", glow: "bg-orange-500" },
  { id: "calm", label: "Tranquil", icon: "🍃", color: "from-teal-400 to-emerald-600", glow: "bg-emerald-400" },
  { id: "happy", label: "Radiant", icon: "✨", color: "from-purple-500 to-pink-500", glow: "bg-purple-500" },
];

export default function Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedMood, setSelectedMood] = useState(moods[3]); // Default: calm

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      localStorage.setItem("currentMood", selectedMood.label);
      
      // -- GUEST LOGIN BYPASS --
      const guestUser = {
        userId: "guest_" + Math.random().toString(36).substring(2, 9),
        name: "Guest Explorer",
        email: "guest@aura.ai",
        isGuest: true
      };
      localStorage.setItem("user", JSON.stringify(guestUser));
      
      // Simulate a small delay for "sanctuary opening" feel
      setTimeout(() => {
        router.push("/chat");
      }, 800);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Aura | Your AI Companion</title>
      </Head>

      <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 bg-slate-950`}>
        
        {/* 🚀 Dynamic Native Notification Banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-10 z-50 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-3"
            >
              <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
              <button onClick={() => setErrorMsg("")} className="text-red-400/50 hover:text-red-400 px-2 py-1">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Dynamic Glowing Background Blob based on mood */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            key={selectedMood.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className={`absolute top-[-10%] left-1/4 w-[50rem] h-[50rem] ${selectedMood.glow} rounded-full mix-blend-screen filter blur-[120px]`}
          />
        </div>

        <div className="flex-1 w-full flex flex-col items-center justify-center px-4 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-2xl text-center"
          >
            {/* Logo / Icon */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className={`w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br ${selectedMood.color} flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/20`}
            >
              <span className="text-4xl filter drop-shadow-md">{selectedMood.icon}</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-6 tracking-tight">
              Find your center.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light mb-16 max-w-lg mx-auto leading-relaxed">
              A private, deeply personalized AI sanctuary designed to map and guide your emotional journey.
            </p>

            {/* Mood Selector UI */}
            <div className="mb-14">
              <p className="text-sm uppercase tracking-[0.2em] font-semibold text-white/50 mb-6">How are you feeling today?</p>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-2">
                <AnimatePresence>
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMood(mood)}
                      className={`relative px-5 py-3 rounded-2xl md:rounded-full font-medium transition-all duration-300 border flex items-center gap-2
                        ${selectedMood.id === mood.id 
                          ? `bg-white/10 border-white/30 text-white shadow-lg` 
                          : `bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/80`
                        }
                      `}
                    >
                      <span>{mood.icon}</span>
                      <span>{mood.label}</span>
                      {selectedMood.id === mood.id && (
                        <motion.div layoutId="glowring" className={`absolute inset-0 rounded-2xl md:rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/30 pointer-events-none`} />
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className={`w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r ${selectedMood.color} text-white font-semibold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50`}
            >
              {loading ? (
                <span className="animate-pulse">Opening sanctuary...</span>
              ) : (
                <>
                  Begin Your Journey
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </motion.button>

          </motion.div>
        </div>

        {/* Floating Privacy Badge */}
        <div className="absolute bottom-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-widest z-10 w-full">
          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Zero-Knowledge Encrypted
        </div>
      </div>
    </>
  );
}