import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    root.classList.toggle("dark", savedTheme === "dark");

    const syncTheme = (event) => {
      const dark = Boolean(event.detail?.dark);
      root.classList.toggle("dark", dark);
    };

    window.addEventListener("theme-change", syncTheme);
    return () => window.removeEventListener("theme-change", syncTheme);
  }, []);

  if (loading) return <Loader />;

  return <Component {...pageProps} />;
}