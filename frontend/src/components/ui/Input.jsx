import { cn } from "../../lib/utils.js";

export default function Input({ label, className = "", id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block space-y-2" htmlFor={inputId}>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600",
          "focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/25 transition-all",
          className
        )}
        {...props}
      />
    </label>
  );
}
