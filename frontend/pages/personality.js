import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { fetchPersonality, setPersonality } from "../utils/api";
import { motion } from "framer-motion";

const personalities = [
  { type: "INFP", label: "The Healer", desc: "Empathetic & deeply intuitive", icon: "🌿", color: "#34d399" },
  { type: "ENFJ", label: "The Guide", desc: "Supportive & motivating", icon: "💬", color: "#60a5fa" },
  { type: "INTJ", label: "The Architect", desc: "Logical & strategic", icon: "🧠", color: "#818cf8" },
  { type: "ESFP", label: "The Spark", desc: "Energetic & uplifting", icon: "⚡", color: "#fb923c" },
];

const therapyModes = [
  { mode: "cbt", title: "Cognitive Behavioral", short: "CBT", desc: "Identify and reframe negative thought patterns", icon: "🔄", color: "#818cf8" },
  { mode: "motivational", title: "Motivational Coaching", short: "MC", desc: "Build on your strengths to achieve wellbeing", icon: "🎯", color: "#34d399" },
  { mode: "deep", title: "Reflective Exploration", short: "RE", desc: "Philosophical deep-dive into your emotional roots", icon: "🌊", color: "#60a5fa" },
];

export default function PersonalityPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("INFP");
  const [selectedMode, setSelectedMode] = useState("cbt");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("user")) { router.push("/"); return; }
    fetchPersonality().then(d => {
      setSelectedType(d.personality || "INFP");
      setSelectedMode(d.therapyMode || "cbt");
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    await setPersonality(selectedType, selectedMode);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div className="h-screen bg-[#030712] flex items-center justify-center">
      <Loader text="Loading preferences..." />
    </div>
  );

  const activePersonality = personalities.find(p => p.type === selectedType);

  return (
    <div className="min-h-screen bg-[#030712] mesh-bg flex flex-col items-center p-4 pb-28">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute top-[-20%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-25"
          style={{background:`radial-gradient(circle, ${activePersonality?.color}25 0%, transparent 70%)`}} />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-6 pt-6">
        {/* Header */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="space-y-1 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400">Personalization</p>
          <h1 className="text-3xl font-bold text-white">AI Companion Style</h1>
          <p className="text-slate-500 text-sm">Tune how your therapist communicates with you.</p>
        </motion.div>

        {/* Personality grid */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Therapist Personality</p>
          <div className="grid grid-cols-2 gap-3">
            {personalities.map((p) => {
              const active = selectedType === p.type;
              return (
                <motion.button
                  key={p.type}
                  whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}
                  onClick={() => setSelectedType(p.type)}
                  className={`relative p-5 rounded-2xl text-left transition-all border ${
                    active ? "border-transparent" : "border-white/8 hover:border-white/15"
                  }`}
                  style={active ? {
                    background: `linear-gradient(135deg, ${p.color}15, ${p.color}08)`,
                    borderColor: `${p.color}40`,
                    boxShadow: `0 0 30px ${p.color}20`,
                  } : { background: "rgba(255,255,255,0.03)" }}
                >
                  {active && <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{background:p.color, boxShadow:`0 0 8px ${p.color}`}} />}
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-bold text-white text-sm">{p.type}</div>
                  <div className="text-xs font-medium mt-0.5" style={{color: active ? p.color : "#64748b"}}>{p.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{p.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Therapy mode */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Therapy Approach</p>
          <div className="space-y-2">
            {therapyModes.map((t) => {
              const active = selectedMode === t.mode;
              return (
                <motion.button
                  key={t.mode}
                  whileHover={{scale:1.01}} whileTap={{scale:0.99}}
                  onClick={() => setSelectedMode(t.mode)}
                  className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all border ${
                    active ? "border-transparent" : "border-white/8 hover:border-white/15"
                  }`}
                  style={active ? {
                    background: `linear-gradient(135deg, ${t.color}12, ${t.color}06)`,
                    borderColor: `${t.color}35`,
                    boxShadow: `0 0 20px ${t.color}15`,
                  } : {background: "rgba(255,255,255,0.03)"}}
                >
                  <div className="text-2xl">{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white text-sm">{t.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md font-mono" style={{background:`${t.color}20`, color:t.color}}>{t.short}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">{t.desc}</p>
                  </div>
                  {active && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:t.color}}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Save button */}
        <motion.button
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          onClick={handleSave}
          disabled={saving}
          whileHover={{scale:1.02}} whileTap={{scale:0.98}}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          style={{
            background: saved
              ? "linear-gradient(135deg, #059669, #34d399)"
              : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            boxShadow: saved
              ? "0 0 30px rgba(52,211,153,0.3)"
              : "0 0 30px rgba(124,58,237,0.35)",
          }}
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
          ) : saved ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Preferences Saved!</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>Save Preferences</>
          )}
        </motion.button>
      </div>
      <Navbar />
    </div>
  );
}
