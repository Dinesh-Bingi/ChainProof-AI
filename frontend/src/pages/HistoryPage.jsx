import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, FileText } from "lucide-react";
import { api } from "../api/client.js";
import GlassCard from "../components/ui/GlassCard.jsx";
import { DashboardSkeleton } from "../components/ui/Skeleton.jsx";
import { fadeUp } from "../lib/motion.js";

const actionLabels = {
  upload: "Uploaded proof",
  verify: "Verified ownership",
  blockchain_register: "Anchored on blockchain",
  similarity_check: "AI similarity check",
  certificate_issued: "Certificate issued",
  login: "Signed in",
  register: "Account created",
};

export default function HistoryPage() {
  const [activity, setActivity] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/history"), api.get("/history/proofs")])
      .then(([actRes, proofRes]) => {
        setActivity(actRes.data.data.items || []);
        setProofs(proofRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div {...fadeUp} className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90 mb-2">Audit trail</p>
        <h1 className="text-3xl font-bold gradient-text font-[family-name:var(--font-display)]">History</h1>
        <p className="text-slate-400 text-sm mt-2">Activity log and proof timeline</p>
      </div>

      <GlassCard title="Activity log" glow>
        {!activity.length ? (
          <p className="text-slate-500 text-sm py-6 text-center">No activity yet.</p>
        ) : (
          <ul className="relative space-y-0">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent" />
            {activity.map((item, i) => (
              <motion.li
                key={item._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex gap-4 pb-5 pl-8"
              >
                <span className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-2 border-violet-500/50 bg-slate-950 flex items-center justify-center">
                  <Clock className="h-2.5 w-2.5 text-violet-400" />
                </span>
                <div className="flex-1 flex justify-between gap-4 text-sm">
                  <span className="text-slate-200 capitalize">
                    {actionLabels[item.action] || item.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-slate-500 shrink-0 text-xs">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard title="All proofs" glow>
        {!proofs.length ? (
          <p className="text-slate-500 text-sm py-6 text-center">No proofs registered.</p>
        ) : (
          <ul className="space-y-1">
            {proofs.map((p, i) => (
              <motion.li
                key={p._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/proofs/${p._id}`}
                  className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-white/[0.03] transition group"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-violet-400 shrink-0" />
                    <span className="text-slate-200 truncate group-hover:text-violet-300 transition">
                      {p.title}
                    </span>
                  </span>
                  <span className="text-slate-500 text-xs shrink-0">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCard>
    </motion.div>
  );
}
