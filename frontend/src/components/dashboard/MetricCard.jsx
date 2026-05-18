import { motion } from "framer-motion";
import AnimatedCounter from "../ui/AnimatedCounter.jsx";
import { cn } from "../../lib/utils.js";

const iconStyles = {
  violet: { icon: "text-violet-300", grad: "from-violet-500/25 via-violet-600/5 to-transparent" },
  emerald: { icon: "text-emerald-300", grad: "from-emerald-500/25 via-emerald-600/5 to-transparent" },
  amber: { icon: "text-amber-300", grad: "from-amber-500/25 via-amber-600/5 to-transparent" },
  cyan: { icon: "text-cyan-300", grad: "from-cyan-500/25 via-cyan-600/5 to-transparent" },
};

export default function MetricCard({ label, value, icon: Icon, accent = "violet", suffix = "", delay = 0 }) {
  const isString = typeof value === "string";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03 }}
      className="glass-panel-glow gradient-border p-5 relative overflow-hidden group"
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-80 transition-opacity duration-500",
          iconStyles[accent]?.grad
        )}
      />
      <motion.div className="relative">
        <div
          className={cn(
            "mb-3 inline-flex rounded-xl bg-white/5 p-2.5 border border-white/10",
            iconStyles[accent]?.icon
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-display)] tracking-tight">
          {isString ? value : <AnimatedCounter value={value} suffix={suffix} />}
        </p>
        <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      </motion.div>
    </motion.div>
  );
}
