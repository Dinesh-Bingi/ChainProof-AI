import { motion } from "framer-motion";

const actionLabels = {
  upload: "Uploaded proof",
  verify: "Verified ownership",
  blockchain_register: "Anchored on blockchain",
  similarity_check: "AI similarity check",
  certificate_issued: "Certificate issued",
  login: "Signed in",
  register: "Account created",
};

export default function ActivityFeed({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-slate-500 py-4">No recent activity.</p>;
  }

  return (
    <ul className="relative space-y-0 max-h-[280px] overflow-y-auto pr-1">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/40 to-transparent" />
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative flex gap-3 pb-4 pl-7 text-sm"
        >
          <span className="absolute left-0 top-1 h-5 w-5 rounded-full bg-violet-600/30 border border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.4)]" />
          <div className="min-w-0">
            <p className="text-slate-200">{actionLabels[item.action] || item.action}</p>
            {item.metadata?.title && (
              <p className="text-slate-500 truncate text-xs">{item.metadata.title}</p>
            )}
            {item.metadata?.txHash && (
              <p className="text-xs font-mono text-slate-600 truncate">{item.metadata.txHash}</p>
            )}
            <p className="text-[10px] text-slate-600 mt-0.5">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
