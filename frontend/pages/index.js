import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";const FEELINGS = [
  { emoji: "😔", label: "Down", value: 1 },
  { emoji: "😊", label: "Content", value: 2 },
  { emoji: "😌", label: "Peaceful", value: 3 },
  { emoji: "🤗", label: "Happy", value: 4 },
  { emoji: "✨", label: "Excited", value: 5 },
];

export default function Landing() {
  const router = useRouter();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const [mood, setMood] = useState(3);
  const [selectedFeeling, setSelectedFeeling] = useState(FEELINGS[2]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const storedMood = Number(localStorage.getItem("currentMood") || "3");
    if (storedMood >= 1 && storedMood <= 5) {
      setMood(storedMood);
      const closest =
        FEELINGS.reduce(
          (best, f) =>
            Math.abs(f.value - storedMood) < Math.abs(best.value - storedMood)
              ? f
              : best,
          FEELINGS[2]
        ) || FEELINGS[2];
      setSelectedFeeling(closest);
    }

  }, [API_BASE, router]);

  const syncMood = (nextValue) => {
    setMood(nextValue);
    localStorage.setItem("currentMood", String(nextValue));
    const closest =
      FEELINGS.reduce(
        (best, f) =>
          Math.abs(f.value - nextValue) < Math.abs(best.value - nextValue)
            ? f
            : best,
        FEELINGS[2]
      ) || FEELINGS[2];
    setSelectedFeeling(closest);
  };

  const handleBegin = () => {
    let user = localStorage.getItem("user");
    if (!user) {
      user = {
        firebaseId: "guest_" + Math.random().toString(36).substring(2, 10),
        name: "Guest User",
        email: "guest@example.com",
      };
      localStorage.setItem("user", JSON.stringify(user));
    }
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-10 md:flex-row md:items-center">
        {/* Left: Hero copy */}
        <div className="flex-1 space-y-6">
          <p className="inline-flex items-center text-xs font-semibold tracking-wide uppercase text-purple-700/80 dark:text-violet-300/90 bg-white/60 dark:bg-white/10 px-3 py-1 rounded-full shadow-sm backdrop-blur">
            AI Therapy Agent
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Your AI mental health companion
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500">
              Find calm, clarity, and support.
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-700/80 dark:text-slate-200/80 max-w-xl">
            Experience a new kind of emotional support. Your AI therapist listens,
            remembers, and adapts to your personality to guide you through what
            you&apos;re feeling today.
          </p>

          {/* Feeling quick-pick + slider */}
          <div className="mt-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/60 dark:border-slate-700 backdrop-blur-xl p-4 shadow-lg">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Whatever you&apos;re feeling, we&apos;re here to listen.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {FEELINGS.map((f) => {
                const active = selectedFeeling.label === f.label;
                return (
                  <button
                    key={f.label}
                    onClick={() => syncMood(f.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                      active
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                        : "bg-white/70 dark:bg-slate-800/80 border border-white/60 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="text-lg">{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Slide to express how you feel today</span>
                <span className="font-medium">
                  {selectedFeeling.emoji} {selectedFeeling.label}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={mood}
                onChange={(e) => syncMood(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleBegin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Begin Your Journey
            </button>

          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Private &amp; secure. Your conversations are encrypted and never used
            for advertising.
          </p>
        </div>

        {/* Right: Feature cards */}
        <div className="flex-1 mt-6 md:mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-white/70 dark:border-slate-700 p-4 shadow-md">
              <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-violet-300 font-semibold mb-1">
                24/7 Support
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                Always here to listen and support you, any time of day.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-white/70 dark:border-slate-700 p-4 shadow-md">
              <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-violet-300 font-semibold mb-1">
                Smart Insights
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                Personalized guidance powered by emotional intelligence and your
                history.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-white/70 dark:border-slate-700 p-4 shadow-md">
              <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-violet-300 font-semibold mb-1">
                Private &amp; Secure
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                Your data stays encrypted and is never shared with third parties.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-white/70 dark:border-slate-700 p-4 shadow-md">
              <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-violet-300 font-semibold mb-1">
                Evidence-Based
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-100">
                Responses grounded in CBT and other science-backed therapeutic
                approaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}