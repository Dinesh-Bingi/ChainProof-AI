import { cn } from "../../lib/utils.js";

const styles = {
  verified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
  flagged: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pending: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function Badge({ status, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status] || styles.pending,
        className
      )}
    >
      {status}
    </span>
  );
}
