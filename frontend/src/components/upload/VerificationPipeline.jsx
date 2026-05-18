import { AnimatePresence, motion } from "framer-motion";
import { Blocks, Brain, CheckCircle2, Cloud, Fingerprint, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.js";

const STEPS = [
  { id: "hash", label: "SHA-256 fingerprint", icon: Fingerprint },
  { id: "ipfs", label: "IPFS storage", icon: Cloud },
  { id: "ai", label: "AI similarity scan", icon: Brain },
  { id: "chain", label: "Blockchain anchor", icon: Blocks },
];

export default function VerificationPipeline({ activeStep = 0, complete = false }) {
  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = complete || i < activeStep;
        const current = !complete && i === activeStep;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500",
              done && "border-emerald-500/30 bg-emerald-500/10",
              current && "border-violet-500/40 bg-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.2)]",
              !done && !current && "border-white/5 bg-slate-950/40"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border",
                done && "border-emerald-500/40 text-emerald-400",
                current && "border-violet-500/40 text-violet-300",
                !done && !current && "border-white/10 text-slate-500"
              )}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.div>
                ) : current ? (
                  <motion.div key="load" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Icon className="h-5 w-5" key="icon" />
                )}
              </AnimatePresence>
            </div>
            <span className={cn("text-sm font-medium", done ? "text-emerald-200" : current ? "text-white" : "text-slate-500")}>
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
