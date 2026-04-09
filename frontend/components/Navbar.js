import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/chat", label: "Chat", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )},
  { href: "/dashboard", label: "Insights", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )},
  { href: "/journal", label: "Journal", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )},
  { href: "/personality", label: "Style", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41" />
    </svg>
  )},
];

export default function Navbar() {
  const router = useRouter();
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(item.href);
          return (
            <Link href={item.href} key={item.href}>
              <div className={`relative flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-violet-500/20 text-violet-300" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl ring-1 ring-violet-400/30" />
                )}
                {item.icon}
                <span className={`text-[10px] font-semibold tracking-wide uppercase ${isActive ? "text-violet-300" : "text-slate-600"}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}