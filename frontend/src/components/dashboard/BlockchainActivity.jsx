import { motion } from "framer-motion";
import { Blocks } from "lucide-react";

export default function BlockchainActivity({ transactions }) {
  if (!transactions?.length) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        No on-chain transactions yet. Upload a proof to anchor on-chain.
      </p>
    );
  }

  return (
    <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {transactions.map((tx, i) => (
        <motion.li
          key={tx.txHash}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-3 hover:border-violet-500/20 transition"
        >
          <div className="min-w-0 flex gap-3">
            <div className="shrink-0 rounded-lg bg-cyan-500/10 p-2 border border-cyan-500/20">
              <Blocks className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{tx.title || "Proof registration"}</p>
              <p className="text-xs font-mono text-slate-500 truncate mt-0.5">{tx.txHash}</p>
              {tx.blockNumber && <p className="text-xs text-violet-400/80 mt-0.5">Block #{tx.blockNumber}</p>}
            </div>
          </div>
          <span className="text-xs text-slate-500 shrink-0">{new Date(tx.timestamp).toLocaleDateString()}</span>
        </motion.li>
      ))}
    </ul>
  );
}
