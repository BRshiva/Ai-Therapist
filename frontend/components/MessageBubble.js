import Image from "next/image";
import { motion } from "framer-motion";

export default function MessageBubble({ role, text }) {
  const isUser = role === "user";

  const personality = typeof window !== "undefined"
    ? localStorage.getItem("personality")
    : "INFP";

  const avatars = {
    INFP: "/avatars/infp.png",
    INTJ: "/avatars/intj.png",
    ENFJ: "/avatars/enfj.png",
    ESFP: "/avatars/esfp.png",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <Image
          src={avatars[personality] || "/ai.png"}
          width={32}
          height={32}
          className="rounded-full"
          alt="AI"
        />
      )}

      <div
        className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow-md ${
          isUser
            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            : "bg-white/70 backdrop-blur-lg border border-white/40 dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>

      {isUser && (
        <Image
          src="/user.png"
          width={32}
          height={32}
          className="rounded-full"
          alt="User"
        />
      )}
    </motion.div>
  );
}