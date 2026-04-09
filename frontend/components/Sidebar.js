import { MessageSquare, LayoutDashboard, Settings, BookOpen, Sliders, LogOut, Plus, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchSessions, createSession, deleteSession, renameSession } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/chat", label: "Therapy", Icon: MessageSquare },
  { href: "/dashboard", label: "Insights", Icon: LayoutDashboard },
  { href: "/journal", label: "Journal", Icon: BookOpen },
  { href: "/personality", label: "AI Style", Icon: Sliders },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar({ currentSessionId, setCurrentSessionId }) {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId?.(data[0]._id);
      } else if (data.length === 0) {
        await handleNewSession();
      }
    } catch (err) { console.error("Failed to load sessions", err); }
    setLoading(false);
  };

  const handleNewSession = async () => {
    try {
      const fresh = await createSession("New Session");
      if (!fresh) return;
      setSessions(prev => [fresh, ...prev]);
      setCurrentSessionId?.(fresh._id);
    } catch (err) { console.error("Failed to create session", err); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteSession(id);
      const updated = sessions.filter(s => s._id !== id);
      setSessions(updated);
      if (currentSessionId === id && updated.length > 0) setCurrentSessionId?.(updated[0]._id);
      else if (updated.length === 0) handleNewSession();
    } catch (err) { console.error("Failed to delete", err); }
  };

  const submitRename = async (id) => {
    if (!editName.trim()) return;
    try {
      const res = await renameSession(id, editName);
      setSessions(sessions.map(s => s._id === id ? res : s));
    } catch (err) { console.error("Failed to rename", err); }
    setEditingId(null);
  };

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/"); };

  return (
    <div className="w-64 h-full flex-shrink-0 hidden md:flex flex-col"
      style={{background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.06)"}}>
      
      {/* Logo */}
      <div className="p-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 0 15px rgba(124,58,237,0.4)"}}>
            ✦
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Mindful AI</h2>
            <p className="text-xs text-slate-600 font-medium">Sanctuary</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="px-3 py-4 border-b border-white/5 space-y-0.5">
        {navLinks.map(({ href, label, Icon }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + "/");
          return (
            <button key={href} onClick={() => router.push(href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                active ? "bg-white/8 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/4"
              }`}>
              <Icon size={15} className={active ? "text-violet-400" : "text-current"} />
              <span className="text-xs font-medium">{label}</span>
              {active && <div className="ml-auto w-1 h-1 rounded-full bg-violet-400" />}
            </button>
          );
        })}
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Conversations</span>
          <button onClick={handleNewSession}
            className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all">
            <Plus size={11} />
          </button>
        </div>

        {loading ? (
          <div className="px-3 py-4 text-xs text-slate-600 animate-pulse text-center">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-700 text-center">No conversations yet</div>
        ) : (
          <AnimatePresence>
            {sessions.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}}
                transition={{delay: i * 0.03}}
                onClick={() => { if(editingId !== s._id) setCurrentSessionId?.(s._id); }}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                  currentSessionId === s._id
                    ? "bg-violet-500/10 border border-violet-500/20"
                    : "hover:bg-white/4 border border-transparent"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{background: currentSessionId === s._id ? "#7c3aed" : "#334155"}} />

                {editingId === s._id ? (
                  <input autoFocus value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => submitRename(s._id)}
                    onKeyDown={e => e.key === "Enter" && submitRename(s._id)}
                    className="flex-1 bg-transparent text-violet-300 text-xs outline-none border-none min-w-0"
                  />
                ) : (
                  <span className={`flex-1 text-xs truncate font-medium ${currentSessionId === s._id ? "text-slate-200" : "text-slate-500"}`}>
                    {s.sessionName || "New Session"}
                  </span>
                )}

                {currentSessionId === s._id && editingId !== s._id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); setEditName(s.sessionName); setEditingId(s._id); }}
                      className="p-1 text-slate-600 hover:text-violet-400 transition-colors">
                      <Edit2 size={10} />
                    </button>
                    <button onClick={e => handleDelete(s._id, e)}
                      className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 flex items-center justify-end">
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-500/70 hover:text-red-400 hover:bg-red-500/8 transition-all font-medium">
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}
