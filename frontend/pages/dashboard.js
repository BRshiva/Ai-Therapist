import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { fetchProgress, fetchInsights } from "../utils/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

const moodMap = { happy:5, joy:5, calm:4, neutral:3, anxious:2, sad:1, angry:1, fear:1, fearful:1, stressed:2, restless:2 };

const moodLabel = (v) => {
  if (v >= 4.5) return { label: "Flourishing", color: "#34d399" };
  if (v >= 3.5) return { label: "Balanced", color: "#60a5fa" };
  if (v >= 2.5) return { label: "Neutral", color: "#a78bfa" };
  if (v >= 1.5) return { label: "Low", color: "#fb923c" };
  return { label: "Heavy", color: "#f87171" };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const { label: mL, color } = moodLabel(score);
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs space-y-1" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p className="text-slate-400">{label}</p>
      <p className="font-bold" style={{ color }}>{mL} · {score}/5</p>
      {payload[0].payload.emotion && <p className="text-slate-500 italic">{payload[0].payload.emotion}</p>}
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [avgMood, setAvgMood] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("user")) { router.push("/"); return; }
    const load = async () => {
      const [res, ins] = await Promise.all([fetchProgress(), fetchInsights()]);
      if (ins?.insight) setInsight(ins.insight);
      const src = res?.entries?.length > 0 ? res.entries : null;
      if (src) {
        const formatted = src.map(e => {
          let mood = moodMap[e.emotion?.toLowerCase()] || 3;
          if (mood < 3 && e.severity > 5) mood -= 1;
          const d = new Date(e.timestamp);
          return {
            interaction: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            mood: Math.max(0.5, mood),
            emotion: e.emotion,
          };
        });
        setData(formatted);
        setAvgMood((formatted.reduce((a, b) => a + b.mood, 0) / formatted.length).toFixed(1));
      } else if (res?.emotions?.length > 0) {
        const formatted = res.emotions.map((em, i) => {
          let mood = moodMap[em?.toLowerCase()] || 3;
          return { interaction: `#${i + 1}`, mood: Math.max(0.5, mood), emotion: em };
        });
        setData(formatted);
        setAvgMood((formatted.reduce((a, b) => a + b.mood, 0) / formatted.length).toFixed(1));
      }
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return <div className="h-screen bg-[#030712] flex items-center justify-center"><Loader text="Analyzing your journey..." /></div>;

  const currentMood = avgMood ? moodLabel(parseFloat(avgMood)) : null;

  return (
    <div className="min-h-screen bg-[#030712] mesh-bg flex flex-col items-center p-4 pb-28">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
        <div className="blob blob-delay absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-6 pt-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400">Progress Tracking</p>
            <h1 className="text-3xl font-bold text-white">Insights</h1>
          </div>
          {currentMood && (
            <div className="glass px-4 py-2.5 rounded-2xl text-right">
              <p className="text-xs text-slate-500">Avg. Mood</p>
              <p className="font-bold text-base" style={{ color: currentMood.color }}>{currentMood.label}</p>
              <p className="text-xs" style={{ color: currentMood.color }}>{avgMood}/5</p>
            </div>
          )}
        </motion.div>

        {/* AI Insight card */}
        {insight && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 space-y-3 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))", border: "1px solid rgba(124,58,237,0.25)", boxShadow: "0 0 40px rgba(124,58,237,0.1)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm">✦</div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
          </motion.div>
        )}

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Mood Timeline</h2>
            <span className="text-xs text-slate-600">{data.length} data points</span>
          </div>

          {data.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="text-3xl">📈</div>
              <p className="text-slate-600 text-sm text-center">Chat more to see your mood trends here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="interaction" stroke="transparent" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} stroke="transparent" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v === 5 ? "Great" : v === 3 ? "Okay" : v === 1 ? "Low" : ""} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(124,58,237,0.3)", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="mood" stroke="#7c3aed" strokeWidth={2.5}
                  fill="url(#moodGrad)" dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#a78bfa", r: 5, strokeWidth: 0, boxShadow: "0 0 10px #7c3aed" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Stats row */}
        {data.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessions", value: data.length, icon: "🗓" },
              { label: "Best Mood", value: `${Math.max(...data.map(d => d.mood))}/5`, icon: "✨" },
              { label: "Streak", value: "Active", icon: "🔥" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-600">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      <Navbar />
    </div>
  );
}