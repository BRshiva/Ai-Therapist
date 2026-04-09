import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { fetchJournals, saveJournal } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Journal() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("user")) { router.push("/"); return; }
    fetchJournals().then(d => { setEntries(d); setLoading(false); });
  }, [router]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const newEntry = await saveJournal(text);
    if (newEntry) { setEntries([newEntry, ...entries]); setText(""); }
    setSaving(false);
  };

  if (loading) return (
    <div className="h-screen bg-[#030712] flex items-center justify-center">
      <Loader text="Loading your journal..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] mesh-bg flex flex-col items-center p-4 pb-28">
      {/* Ambient blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="blob absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-30" style={{background: "radial-gradient(circle, rgba(219,39,119,0.15) 0%, transparent 70%)"}} />
        <div className="blob blob-delay absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-20" style={{background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)"}} />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-6 pt-6">
        {/* Header */}
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400">Mental Wellness</p>
          <h1 className="text-3xl font-bold text-white">Journal</h1>
          <p className="text-slate-500 text-sm">A private space for your thoughts. Reflect, process, and grow.</p>
        </motion.div>

        {/* Compose area */}
        <motion.div
          initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}
          className="glass rounded-3xl p-6 space-y-4"
          style={{boxShadow: "0 0 40px rgba(219,39,119,0.05), inset 0 1px 0 rgba(255,255,255,0.05)"}}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'})}
            </span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's on your mind today? Write freely — this is your safe space..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-600 resize-none outline-none text-base leading-relaxed min-h-[140px] font-light"
          />
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <span className="text-xs text-slate-600">{text.length} characters</span>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #db2777, #7c3aed)",
                boxShadow: text.trim() ? "0 0 20px rgba(219,39,119,0.3)" : "none",
              }}
            >
              {saving ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save Entry</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Past entries */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-1">Past Entries</h2>
          {entries.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-slate-600 text-sm">Your journal is empty.<br />Write your first entry above.</p>
            </div>
          ) : (
            <AnimatePresence>
              {entries.map((e, idx) => (
                <motion.div
                  key={e._id || idx}
                  initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{delay: idx * 0.04}}
                  className="glass rounded-2xl p-5 space-y-3 hover:border-violet-500/20 transition-colors cursor-default"
                  style={{boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      <p className="text-xs text-pink-400 font-medium">
                        {new Date(e.date).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric', year:'numeric'})}
                      </p>
                    </div>
                    {e.emotionTags?.length > 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{background:"rgba(139,92,246,0.15)", color:"#a78bfa"}}>
                        {e.emotionTags[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-light">{e.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <Navbar />
    </div>
  );
}