import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [insights, setInsights] = useState(null);
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.uid;
      if (!userId) return;

      const res = await axios.get(`${API_BASE}/progress/${userId}`);

      const entries = res.data.entries || [];
      const emotions = res.data.emotions || [];

      const moodScore = (emotion) => {
        const e = String(emotion || "").toLowerCase();
        if (e === "happy") return 3;
        if (e === "neutral") return 2;
        if (e === "anxious") return 1.5;
        if (e === "sad") return 1;
        return 2;
      };

      if (entries.length) {
        const mapped = entries
          .map((x) => ({
            emotion: x.emotion,
            severity: x.severity,
            t: x.recordedAt ? new Date(x.recordedAt).getTime() : null,
          }))
          .filter((x) => typeof x.t === "number")
          .sort((a, b) => a.t - b.t);

        const now = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        const weeks = 4;
        const start = now - weeks * weekMs;

        const windowed = mapped.filter((x) => x.t >= start);
        const weeklyBuckets = Array.from({ length: weeks }, (_, i) => {
          const bucketStart = start + i * weekMs;
          const bucketEnd = bucketStart + weekMs;
          const list = windowed.filter((x) => x.t >= bucketStart && x.t < bucketEnd);
          return { i, bucketStart, bucketEnd, list };
        });

        const avg = (list) => {
          if (!list.length) return 0;
          const sum = list.reduce((acc, x) => acc + moodScore(x.emotion), 0);
          return sum / list.length;
        };

        const countsByEmotion = (list) => {
          return list.reduce((acc, x) => {
            const key = String(x.emotion || "neutral");
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
        };

        const lastWeek = weeklyBuckets[weeks - 1]?.list || [];
        const prevWeek = weeklyBuckets[weeks - 2]?.list || [];

        const topEmotion = (() => {
          const c = countsByEmotion(lastWeek);
          const pairs = Object.entries(c);
          if (!pairs.length) return "neutral";
          pairs.sort((a, b) => b[1] - a[1]);
          return pairs[0][0];
        })();

        const severityCounts = (() => {
          const c = { low: 0, medium: 0, high: 0 };
          lastWeek.forEach((x) => {
            const s = String(x.severity || "low").toLowerCase();
            if (c[s] !== undefined) c[s] += 1;
          });
          return c;
        })();

        const weeklyAvg = weeklyBuckets.map((b, idx) => {
          const v = avg(b.list);
          return { label: `Week ${idx + 1}`, mood: v };
        });

        const avgPrev = avg(prevWeek);
        const avgCurr = avg(lastWeek);
        const delta = avgCurr - avgPrev;

        const trendLabel =
          !avgPrev || !avgCurr
            ? "Not enough data to compare yet"
            : delta > 0.15
              ? "Improving"
              : delta < -0.15
                ? "Worsening"
                : "Staying steady";

        setChartData(weeklyAvg);

        setInsights({ topEmotion, trendLabel, severityCounts });
      } else {
        const formatted = emotions.map((e, index) => ({
          day: index + 1,
          mood: moodScore(e),
        }));
        setChartData(formatted);
        setInsights(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 pb-20">
      <Profile />
      <h1 className="text-xl font-semibold mb-4">
        Your Mental Health Progress 📊
      </h1>

      <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow dark:bg-slate-900/50">
        {insights ? (
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="text-sm text-slate-700 dark:text-slate-200">
              <p className="font-medium">
                Trend:{" "}
                <span className="text-purple-700 dark:text-violet-300">
                  {insights.trendLabel}
                </span>
              </p>
              <p className="mt-1">
                Most common emotion (last 7 days):{" "}
                <span className="font-medium text-purple-700 dark:text-violet-300">
                  {insights.topEmotion}
                </span>
              </p>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-200">
              <p className="font-medium">Severity</p>
              <p>Low: {insights.severityCounts.low}</p>
              <p>Medium: {insights.severityCounts.medium}</p>
              <p>High: {insights.severityCounts.high}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-200 mb-2">
            Tracking your mood pattern over time.
          </div>
        )}

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey={insights ? "label" : "day"} />
            <YAxis domain={[0, 3]} ticks={[1, 1.5, 2, 2.5, 3]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Navbar />
    </div>
  );
}