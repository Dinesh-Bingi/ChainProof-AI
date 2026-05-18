import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Blocks, Brain, FileCheck, Shield, Sparkles } from "lucide-react";
import AuroraBackground from "../components/effects/AuroraBackground.jsx";
import Button from "../components/ui/Button.jsx";
import { fadeUp, staggerContainer, staggerItem } from "../lib/motion.js";

const features = [
  {
    icon: FileCheck,
    title: "IP Ownership Proof",
    desc: "SHA-256 fingerprints with immutable timestamps and audit trails.",
    color: "from-violet-600/30 to-fuchsia-600/10",
  },
  {
    icon: Blocks,
    title: "Blockchain Anchoring",
    desc: "Register content hashes on-chain via ChainProofRegistry smart contracts.",
    color: "from-cyan-600/20 to-violet-600/10",
  },
  {
    icon: Brain,
    title: "AI Similarity Engine",
    desc: "Detect plagiarism and duplicate uploads with semantic similarity scoring.",
    color: "from-fuchsia-600/25 to-violet-600/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuroraBackground />

      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 shadow-lg shadow-violet-600/30"
            >
              <Shield className="h-5 w-5 text-white" />
            </motion.div>
            <span className="font-bold text-lg font-[family-name:var(--font-display)]">ChainProof AI</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 text-center">
        <motion.div {...fadeUp}>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Decentralized IP Protection · Web3 Native
          </motion.span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] max-w-4xl mx-auto font-[family-name:var(--font-display)]">
            <span className="gradient-text">Prove ownership.</span>
            <br />
            <span className="text-white">Anchor on-chain.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ChainProof AI combines IPFS storage, Solidity smart contracts, and AI-powered similarity
            detection — built for demos, hackathons, and production-grade IP verification.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="px-8 py-3 text-base">
                Start protecting <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-8 py-3 text-base">
                Open dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 max-w-6xl mx-auto px-4 pb-24 grid md:grid-cols-3 gap-5"
      >
        {features.map(({ icon: Icon, title, desc, color }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass-panel-glow gradient-border p-6 text-left group"
          >
            <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 border border-white/10`}>
              <Icon className="h-7 w-7 text-violet-300 group-hover:text-white transition" />
            </div>
            <h3 className="font-semibold text-white text-lg">{title}</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
