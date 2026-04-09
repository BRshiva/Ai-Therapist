export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Rotating gradient ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "#a78bfa",
            borderRightColor: "#818cf8",
            animation: "spin 1s linear infinite",
          }}
        />
        <div className="absolute inset-2 rounded-full bg-violet-500/10 backdrop-blur-sm flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        </div>
      </div>
      <p className="text-slate-500 text-sm font-medium tracking-wide">{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
