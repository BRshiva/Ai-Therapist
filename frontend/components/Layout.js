import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}