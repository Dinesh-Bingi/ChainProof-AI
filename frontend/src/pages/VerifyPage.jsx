import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileSearch, Hash, XCircle } from "lucide-react";
import { api } from "../api/client.js";
import Button from "../components/ui/Button.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import Input from "../components/ui/Input.jsx";
import { fadeUp } from "../lib/motion.js";
import { cn } from "../lib/utils.js";

function normalizeHash(input) {
  return input.trim().replace(/^0x/i, "").replace(/\s+/g, "").toLowerCase();
}

function getVerifyError(err) {
  const details = err.response?.data?.details;
  const fieldErr = details?.fieldErrors?.body?.contentHash?.[0];
  if (fieldErr) return fieldErr;
  if (err.response?.data?.message === "Validation failed") {
    return "Invalid SHA-256 hash — paste 64 hex characters with no spaces (or use Verify by file).";
  }
  return err.response?.data?.message || "Verification failed";
}

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyByHash = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const contentHash = normalizeHash(hash);
    if (contentHash.length !== 64) {
      setError(
        `Hash must be 64 characters after removing spaces (yours is ${contentHash.length}). Copy the full SHA-256 from your proof details.`
      );
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post("/verify/hash", { contentHash });
      setResult(data.data);
    } catch (err) {
      setError(getVerifyError(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyByFile = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/verify/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.data);
    } catch (err) {
      setError(getVerifyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90 mb-2">Trust layer</p>
        <h1 className="text-3xl font-bold gradient-text font-[family-name:var(--font-display)]">
          Verify ownership
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Cross-check database records and blockchain anchors for any content hash.
        </p>
      </div>

      <GlassCard title="Verify by hash" glow>
        <form onSubmit={verifyByHash} className="space-y-4">
          <Input
            label="SHA-256 content hash"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="64-character hex (spaces OK)"
            className="font-mono text-xs"
            required
          />
          <Button type="submit" loading={loading}>
            <Hash className="h-4 w-4" /> Verify hash
          </Button>
        </form>
      </GlassCard>

      <GlassCard title="Verify by file" glow>
        <form onSubmit={verifyByFile} className="space-y-4">
          <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-8 cursor-pointer hover:border-violet-500/40 transition">
            <FileSearch className="h-8 w-8 text-violet-400 mb-2" />
            <span className="text-sm text-slate-400">{file ? file.name : "Choose file to hash & verify"}</span>
            <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <Button type="submit" loading={loading} variant="secondary" className="w-full">
            Hash & verify file
          </Button>
        </form>
      </GlassCard>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard
              title="Verification result"
              glow
              className={cn(result.verified ? "border-emerald-500/20" : "border-amber-500/20")}
            >
              <motion.div className="flex items-center gap-3 mb-4">
                {result.verified ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                ) : (
                  <XCircle className="h-10 w-10 text-amber-400" />
                )}
                <div>
                  <p className={cn("font-semibold", result.verified ? "text-emerald-300" : "text-amber-300")}>
                    {result.verified ? "Verified" : "Not fully verified"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Database & chain cross-reference</p>
                </div>
              </motion.div>

              <div className="space-y-3 text-sm">
                {result.contentHash && (
                  <p className="font-mono text-xs text-slate-500 break-all bg-slate-950/50 rounded-lg p-3 border border-white/5">
                    {result.contentHash}
                  </p>
                )}
                {result.database ? (
                  <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-4 space-y-1">
                    <p className="font-medium text-slate-200">{result.database.title}</p>
                    <p className="text-slate-400">Owner: {result.database.owner?.name || result.database.owner?.email}</p>
                    <p className="text-slate-500 font-mono text-xs truncate">IPFS: {result.database.ipfsCid}</p>
                  </div>
                ) : (
                  <p className="text-slate-500">No proof found in the database for this hash.</p>
                )}
                {result.blockchain?.onChain && (
                  <p className="text-slate-400">
                    On-chain: {result.blockchain.exists ? "Found ✓" : "Not found"}
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
