import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Profile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-between bg-white/70 backdrop-blur-xl p-3 rounded-xl shadow mb-4 dark:bg-slate-900/50 dark:border dark:border-white/10">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold overflow-hidden border border-violet-200">
          {user.photoURL ? (
            <img src={user.photoURL} alt="user" className="w-full h-full object-cover" />
          ) : (
            <span>{user.name?.charAt(0) || "G"}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user.name || user.displayName || "Explorer"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="text-red-500 text-sm hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
