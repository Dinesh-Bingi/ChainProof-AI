import { motion } from "framer-motion";
import { cn } from "../../lib/utils.js";

export default function GlassCard({
  children,
  className = "",
  title,
  action,
  glow = false,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cn(glow ? "glass-panel-glow gradient-border" : "glass-panel", "p-5 md:p-6", className)}
      {...props}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-sm font-semibold text-slate-100 tracking-wide">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}
