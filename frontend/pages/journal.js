import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Journal() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.uid;
    if (!userId) return;

    const res = await axios.get(`${API_BASE}/journal/${userId}`);
    setEntries(res.data);
  };

  const saveEntry = async () => {
    if (!text) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.uid;
    if (!userId) return;

    await axios.post(`${API_BASE}/journal`, {
      text,
      userId,
    });

    setText("");
    fetchEntries();
  };

  return (
    <div className="p-4 pb-20">

      <h1 className="text-xl font-semibold mb-4">
        Journal Your Thoughts 📝
      </h1>

      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write what's on your mind..."
        className="w-full p-3 rounded-xl border mb-3"
        rows={4}
      />

      <button
        onClick={saveEntry}
        className="w-full bg-purple-600 text-white p-3 rounded-xl mb-4"
      >
        Save Entry
      </button>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((e) => (
          <div
            key={e._id}
            className="bg-white/70 backdrop-blur-xl p-3 rounded-xl shadow dark:bg-white/5"
          >
            <p className="text-sm">{e.text}</p>
            <p className="text-xs text-gray-400 mt-1">
              {e.createdAt ? new Date(e.createdAt).toLocaleString() : ""}
            </p>
          </div>
        ))}
      </div>

      <Navbar />
    </div>
  );
}