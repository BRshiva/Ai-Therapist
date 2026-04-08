import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const questions = [
  { q: "You feel energized by:", a: "E", b: "I", optA: "People", optB: "Alone time" },
  { q: "You focus more on:", a: "S", b: "N", optA: "Reality", optB: "Ideas" },
  { q: "You decide using:", a: "T", b: "F", optA: "Logic", optB: "Emotions" },
  { q: "You prefer:", a: "J", b: "P", optA: "Planning", optB: "Flexibility" },

  // Repeat pattern to make ~16 questions
  { q: "You enjoy:", a: "E", b: "I", optA: "Social events", optB: "Quiet time" },
  { q: "You trust:", a: "S", b: "N", optA: "Facts", optB: "Intuition" },
  { q: "You value:", a: "T", b: "F", optA: "Truth", optB: "Harmony" },
  { q: "You work:", a: "J", b: "P", optA: "Structured", optB: "Flexible" },

  { q: "You prefer:", a: "E", b: "I", optA: "Groups", optB: "Solo" },
  { q: "You think:", a: "S", b: "N", optA: "Practical", optB: "Creative" },
  { q: "You react:", a: "T", b: "F", optA: "Rationally", optB: "Emotionally" },
  { q: "You plan:", a: "J", b: "P", optA: "Ahead", optB: "Last minute" },

  { q: "You like:", a: "E", b: "I", optA: "Talking", optB: "Listening" },
  { q: "You focus:", a: "S", b: "N", optA: "Details", optB: "Big picture" },
  { q: "You decide:", a: "T", b: "F", optA: "Head", optB: "Heart" },
  { q: "You live:", a: "J", b: "P", optA: "Organized", optB: "Spontaneous" },
];

export default function PersonalityTest() {
  const [answers, setAnswers] = useState([]);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const handleAnswer = (type) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (newAnswers.length === questions.length) {
      const result = calculatePersonality(newAnswers);
      localStorage.setItem("personality", result);
      syncPersonality(result);
    }
  };

  const syncPersonality = async (personalityType) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.uid) {
        await axios.put(`${API_BASE}/user/personality`, {
          firebaseId: user.uid,
          personalityType,
        });
      }
    } catch (error) {
      console.error("Could not sync personality to backend:", error);
    } finally {
      router.push("/chat");
    }
  };

  const calculatePersonality = (answers) => {
    const counts = { E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0 };
    answers.forEach(a => counts[a]++);

    return (
      (counts.E > counts.I ? "E" : "I") +
      (counts.S > counts.N ? "S" : "N") +
      (counts.T > counts.F ? "T" : "F") +
      (counts.J > counts.P ? "J" : "P")
    );
  };

  const q = questions[answers.length];

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 to-pink-100 p-6">

      <h2 className="text-2xl font-bold mb-6 text-center">
        {q.q}
      </h2>

      <div className="flex gap-4">
        <button onClick={() => handleAnswer(q.a)} className="bg-purple-500 text-white px-6 py-3 rounded-xl">
          {q.optA}
        </button>

        <button onClick={() => handleAnswer(q.b)} className="bg-pink-500 text-white px-6 py-3 rounded-xl">
          {q.optB}
        </button>
      </div>

    </div>
  );
}