import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Shield } from "lucide-react";
import { api } from "../api/client.js";
import UploadDropzone from "../components/upload/UploadDropzone.jsx";
import VerificationPipeline from "../components/upload/VerificationPipeline.jsx";
import Button from "../components/ui/Button.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import Input from "../components/ui/Input.jsx";
import { fadeUp } from "../lib/motion.js";

export default function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const timers = [
      setTimeout(() => setPipelineStep(1), 400),
      setTimeout(() => setPipelineStep(2), 1200),
      setTimeout(() => setPipelineStep(3), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setPipelineStep(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    if (description) formData.append("description", description);

    try {
      const { data } = await api.post("/proofs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPipelineStep(4);
      setResult(data.data);
      setTimeout(() => navigate(`/proofs/${data.data.proof._id}`), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...fadeUp} className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90 mb-2">
          Secure upload
        </p>
        <h1 className="text-3xl font-bold gradient-text font-[family-name:var(--font-display)]">
          Register proof
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Hash → IPFS → AI scan → blockchain anchor. One cinematic flow.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <GlassCard className="lg:col-span-3" glow>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-300">Description (optional)</span>
              <textarea
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-h-[80px] transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this proof represent?"
              />
            </label>

            <UploadDropzone file={file} onFileSelect={setFile} disabled={loading} />

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} className="w-full" disabled={!file || !title}>
              <Shield className="h-4 w-4" />
              Register on ChainProof
            </Button>
          </form>
        </GlassCard>

        <div className="lg:col-span-2 space-y-4">
          <GlassCard title="Verification pipeline" glow>
            <VerificationPipeline
              activeStep={loading ? pipelineStep : result ? 4 : 0}
              complete={!!result}
            />
          </GlassCard>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel-glow gradient-border rounded-2xl p-5 border border-emerald-500/30"
              >
                <div className="flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 className="h-8 w-8 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Proof registered</p>
                    <p className="text-sm text-emerald-200/80 mt-0.5">
                      Similarity: {(result.proof.similarityScore * 100).toFixed(1)}% · Redirecting…
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
