import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { fetchPersonality, setPersonality } from "../utils/api";
import { motion } from "framer-motion";

const therapyOptions = [
  { value: "cbt", label: "Cognitive Behavioral (CBT)" },
  { value: "motivational", label: "Motivational Coaching" },
  { value: "deep", label: "Reflective Exploration" },
];

const mbtiGroups = [
  { label: "Diplomats", options: ["INFP", "INFJ", "ENFJ", "ENFP"] },
  { label: "Analysts", options: ["INTJ", "INTP", "ENTJ", "ENTP"] },
  { label: "Sentinels", options: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] },
  { label: "Explorers", options: ["ISTP", "ISFP", "ESTP", "ESFP"] },
];

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [therapyMode, setTherapyModeLocal] = useState("cbt");
  const [personalityType, setPersonalityTypeLocal] = useState("INFP");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (!localUser) { router.push("/"); return; }
    setUser(JSON.parse(localUser));
    fetchPersonality().then(res => {
      if (res) {
        setTherapyModeLocal(res.therapyMode || "cbt");
        setPersonalityTypeLocal(res.personality || "INFP");
      }
    });
  }, [router]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      await setPersonality(personalityType, therapyMode);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="h-screen w-full bg-[#030712] flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
        <div className="min-h-full p-6 md:p-10 pb-28 md:pb-10 max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{opacity:0,y:-15}} animate={{opacity:1,y:0}} className="space-y-1 pt-2">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400">Account</p>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-500 text-sm">Manage your account and AI preferences.</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
            className="glass rounded-3xl p-6 flex items-center gap-5"
            style={{boxShadow:"inset 0 1px 0 rgba(255,255,255,0.05)"}}>
            <div className="relative">
              <img
                src={user.photo || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover"
                style={{boxShadow:"0 0 20px rgba(124,58,237,0.3)"}}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#030712]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-base truncate">{user.name || user.displayName || "User"}</p>
              <p className="text-slate-500 text-sm truncate">{user.email || ""}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Active session</span>
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
            className="glass rounded-3xl p-6 space-y-6"
            style={{boxShadow:"inset 0 1px 0 rgba(255,255,255,0.05)"}}>
            <h2 className="text-sm font-semibold text-white">AI Therapist Preferences</h2>

            {/* Therapy Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Therapy Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {therapyOptions.map(opt => {
                  const active = therapyMode === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setTherapyModeLocal(opt.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
                        active
                          ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                          : "bg-white/[0.03] border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-400"
                      }`}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Therapist Personality (MBTI)</label>
              <div className="space-y-3">
                {mbtiGroups.map(g => (
                  <div key={g.label}>
                    <p className="text-xs text-slate-600 mb-1.5">{g.label}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {g.options.map(opt => {
                        const active = personalityType === opt;
                        return (
                          <button key={opt} onClick={() => setPersonalityTypeLocal(opt)}
                            className={`px-2 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                              active
                                ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                                : "bg-white/[0.03] border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-400"
                            }`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: saved ? "linear-gradient(135deg,#059669,#34d399)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                boxShadow: saved ? "0 0 25px rgba(52,211,153,0.25)" : "0 0 25px rgba(124,58,237,0.25)",
              }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                : saved
                ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Saved!</>
                : "Save Preferences"}
            </button>
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="rounded-3xl p-6 border border-red-500/15 space-y-4"
            style={{background:"rgba(239,68,68,0.04)"}}>
            <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
            <button
              onClick={() => { localStorage.removeItem("user"); router.push("/"); }}
              className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </motion.div>
        </div>

        {/* Mobile navbar */}
        <div className="md:hidden">
          <Navbar />
        </div>
      </div>
    </div>
  );
}
