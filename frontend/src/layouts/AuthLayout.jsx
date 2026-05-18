import { Navigate, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuroraBackground from "../components/effects/AuroraBackground.jsx";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen relative grid lg:grid-cols-2">
      <AuroraBackground />

      <div className="hidden lg:flex relative z-10 flex-col justify-between p-12 border-r border-white/5">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2">
            <Shield className="h-7 w-7" />
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-display)]">ChainProof AI</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise-grade security
          </span>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight font-[family-name:var(--font-display)]">
            Prove ownership.
            <br />
            <span className="gradient-text">Anchor on-chain.</span>
          </h1>
          <p className="mt-5 text-slate-400 max-w-md leading-relaxed">
            Register intellectual property with IPFS storage, blockchain hashes, and AI-powered
            similarity detection — trusted by builders worldwide.
          </p>
        </motion.div>

        <p className="text-xs text-slate-600">© ChainProof AI · Secured with JWT & Firebase</p>
      </div>

      <div className="relative z-10 flex items-center justify-center p-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-panel-glow gradient-border rounded-2xl p-8"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
