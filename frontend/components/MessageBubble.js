import { motion } from "framer-motion";

const personalityColors = {
  INFP: { from: "#c084fc", to: "#818cf8", bg: "rgba(192,132,252,0.08)" },
  ENFJ: { from: "#34d399", to: "#06b6d4", bg: "rgba(52,211,153,0.08)" },
  INTJ: { from: "#60a5fa", to: "#818cf8", bg: "rgba(96,165,250,0.08)" },
  ESFP: { from: "#fb923c", to: "#f472b6", bg: "rgba(251,146,60,0.08)" },
  default: { from: "#a78bfa", to: "#818cf8", bg: "rgba(167,139,250,0.08)" },
};

export default function MessageBubble({ role, text, personalityType }) {
  const isUser = role === "user";
  const colors = personalityColors[personalityType] || personalityColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-lg mt-1"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            boxShadow: `0 4px 15px ${colors.from}40`,
          }}
        >
          ✦
        </div>
      )}

      {/* Bubble */}
      <div
        className={`relative max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-all ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-violet-900/40"
            : "text-slate-200 rounded-tl-sm border border-white/8"
        }`}
        style={
          !isUser
            ? {
                background: colors.bg,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderColor: `${colors.from}25`,
              }
            : {}
        }
      >
        {text || <span className="inline-flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
        </span>}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-violet-300 mt-1">
          U
        </div>
      )}
    </motion.div>
  );
}