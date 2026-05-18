import { motion } from "framer-motion";
import { cn } from "../../lib/utils.js";

const variants = {
  primary:
    "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_auto] text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 border border-white/10",
  secondary:
    "bg-white/[0.06] text-slate-100 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 backdrop-blur-sm",
  ghost: "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
  danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  loading,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
