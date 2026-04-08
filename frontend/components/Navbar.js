import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem("theme") === "dark");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { dark: next } }));
  };

  return (
    <div className={`flex justify-between items-center px-6 py-4 backdrop-blur-lg shadow-md rounded-b-2xl ${
      isDark ? "bg-slate-900/70 text-slate-100" : "bg-white/30"
    }`}>
      
      <h1 className={`text-xl font-bold ${isDark ? "text-violet-300" : "text-purple-700"}`}>
        MindEase 💜
      </h1>

      <div className="flex gap-4">
        <button onClick={() => router.push("/chat")} className={isDark ? "hover:text-violet-300" : "hover:text-purple-600"}>
          Chat
        </button>
        <button onClick={() => router.push("/dashboard")} className={isDark ? "hover:text-violet-300" : "hover:text-purple-600"}>
          Dashboard
        </button>
        <button onClick={() => router.push("/journal")} className={isDark ? "hover:text-violet-300" : "hover:text-purple-600"}>
          Journal
        </button>
        <button onClick={toggleTheme} className="px-3 py-1 rounded-lg bg-white/30 border border-white/30">
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

    </div>
  );
}