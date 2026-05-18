import { motion } from "framer-motion";

export default function AuroraBackground({ className = "" }) {
  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 noise-overlay" />
      <motion.div
        className="absolute -top-1/2 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/25 blur-[120px]"
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[100px]"
        animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-fuchsia-600/20 blur-[110px]"
        animate={{ x: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
