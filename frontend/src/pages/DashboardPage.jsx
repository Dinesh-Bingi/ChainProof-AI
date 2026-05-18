import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Blocks,
  CheckCircle2,
  Cloud,
  FileStack,
  Percent,
  Radio,
  Upload,
  Zap,
} from "lucide-react";
import { api } from "../api/client.js";
import MetricCard from "../components/dashboard/MetricCard.jsx";
import UploadAreaChart from "../components/dashboard/UploadAreaChart.jsx";
import StatusPieChart from "../components/dashboard/StatusPieChart.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";
import BlockchainActivity from "../components/dashboard/BlockchainActivity.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { DashboardSkeleton } from "../components/ui/Skeleton.jsx";
import { staggerContainer, staggerItem } from "../lib/motion.js";
import { cn } from "../lib/utils.js";

function ChainPulse({ configured, blockNumber }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        {configured && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-3 w-3 rounded-full",
            configured ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-amber-500"
          )}
        />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-200">
          {configured ? "Blockchain live" : "Chain offline"}
        </p>
        <p className="text-xs text-slate-500">
          {configured ? `Block #${blockNumber ?? "—"}` : "Configure RPC in .env"}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [chainTx, setChainTx] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/proofs/dashboard"),
      api.get("/blockchain/transactions"),
      api.get("/blockchain/status"),
    ])
      .then(([dash, tx, status]) => {
        setAnalytics(dash.data.data);
        setChainTx(tx.data.data);
        setChainStatus(status.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const s = analytics?.summary ?? {};

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={staggerItem} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90 mb-2">
            Command center
          </p>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text font-[family-name:var(--font-display)]">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Real-time IP proofs, IPFS storage, blockchain anchors, and AI verification — all in one view.
          </p>
        </div>
        <Link to="/upload">
          <Button>
            <Upload className="h-4 w-4" /> New upload
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <MetricCard label="Total proofs" value={s.total ?? 0} icon={FileStack} delay={0} />
        <MetricCard label="Verified" value={s.verified ?? 0} icon={CheckCircle2} accent="emerald" delay={0.05} />
        <MetricCard label="Flagged" value={s.flagged ?? 0} icon={AlertTriangle} accent="amber" delay={0.1} />
        <MetricCard label="On-chain" value={s.onChain ?? 0} icon={Blocks} accent="cyan" delay={0.15} />
        <MetricCard label="IPFS stored" value={s.ipfsStored ?? 0} icon={Cloud} delay={0.2} />
        <MetricCard label="Verify rate" value={s.verificationRate ?? 0} suffix="%" icon={Percent} delay={0.25} />
      </motion.div>

      <motion.div variants={staggerItem} className="grid lg:grid-cols-3 gap-4">
        <GlassCard title="Upload analytics" className="lg:col-span-2" glow delay={0.1}>
          <UploadAreaChart data={analytics?.uploadsByDay} />
        </GlassCard>

        <GlassCard title="Proof status" glow delay={0.15}>
          <StatusPieChart verified={s.verified} flagged={s.flagged} pending={s.pending} />
        </GlassCard>
      </motion.div>

      <motion.div variants={staggerItem} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlassCard title="Network status" glow delay={0.12}>
          <ChainPulse configured={chainStatus?.configured} blockNumber={chainStatus?.blockNumber} />
          <dl className="mt-5 space-y-3 text-sm border-t border-white/5 pt-4">
            <div className="flex justify-between">
              <dt className="text-slate-500">Chain ID</dt>
              <dd className="text-slate-300 font-mono text-xs">{chainStatus?.chainId ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Global on-chain</dt>
              <dd className="text-slate-300">{chainStatus?.totalOnChain ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Avg similarity</dt>
              <dd className="text-violet-300 font-medium">{s.avgSimilarity ?? 0}</dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard
          title="Live verification"
          glow
          delay={0.18}
          action={<Radio className="h-4 w-4 text-emerald-400 animate-pulse" />}
        >
          <motion.div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <Zap className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-200">AI engine active</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {s.flagged ? `${s.flagged} proofs flagged for review` : "No flagged content detected"}
              </p>
            </div>
          </motion.div>
          <p className="mt-4 text-xs text-slate-500">
            Similarity scans run on every upload. Threshold breaches are logged automatically.
          </p>
        </GlassCard>

        <GlassCard title="AI activity timeline" className="md:col-span-2 lg:col-span-1" glow delay={0.2}>
          <ActivityFeed items={analytics?.activityFeed} />
        </GlassCard>
      </motion.div>

      <motion.div variants={staggerItem} className="grid lg:grid-cols-2 gap-4">
        <GlassCard title="Recent proofs" glow delay={0.1}>
          {!analytics?.recent?.length ? (
            <p className="text-slate-500 text-sm py-8 text-center">
              No proofs yet.{" "}
              <Link to="/upload" className="text-violet-400 hover:underline">
                Upload your first file
              </Link>
            </p>
          ) : (
            <ul className="space-y-1">
              {analytics.recent.map((proof, i) => (
                <motion.li
                  key={proof._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-white/[0.03] transition"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/proofs/${proof._id}`}
                      className="font-medium text-slate-200 hover:text-violet-300 truncate block transition"
                    >
                      {proof.title}
                    </Link>
                    <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5">
                      {proof.contentHash?.slice(0, 24)}…
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge status={proof.status} />
                    {proof.blockchainRegistered && (
                      <span className="text-[10px] text-emerald-400 font-medium">on-chain</span>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Blockchain transactions" glow delay={0.15}>
          <BlockchainActivity transactions={chainTx} />
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
