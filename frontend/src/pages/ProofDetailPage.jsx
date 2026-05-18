import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, Fingerprint } from "lucide-react";
import { api } from "../api/client.js";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { fadeUp } from "../lib/motion.js";

function downloadPdfBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProofDetailPage() {
  const { id } = useParams();
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/proofs/${id}`)
      .then((res) => setProof(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadCert = async (certId, filename = "chainproof-certificate.pdf") => {
    const res = await api.get(`/certificates/${certId}/download`, { responseType: "blob" });
    downloadPdfBlob(res.data, filename);
  };

  const issueCertificate = async () => {
    setError("");
    setCertLoading(true);
    try {
      const { data } = await api.post(`/certificates/${id}`);
      const cert = data.data;
      const certId = cert._id || cert.id;
      await downloadCert(certId, `${cert.certificateNumber}.pdf`);
      setProof((prev) => ({ ...prev, certificateId: certId }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue certificate");
    } finally {
      setCertLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!proof) return <p className="text-red-400">Proof not found</p>;

  return (
    <motion.div {...fadeUp} className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90 mb-2">Proof record</p>
          <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-display)]">{proof.title}</h1>
          <div className="mt-3">
            <Badge status={proof.status} />
          </div>
        </div>
        {proof.status === "verified" && (
          <Button onClick={issueCertificate} loading={certLoading} variant="secondary">
            <Download className="h-4 w-4" /> Issue certificate
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard title="Content fingerprint" glow>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">File</dt>
              <dd className="text-slate-200 mt-1">{proof.fileName}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <Fingerprint className="h-3 w-3" /> SHA-256
              </dt>
              <dd className="font-mono text-xs text-violet-200/90 break-all mt-1 bg-slate-950/50 rounded-lg p-3 border border-white/5">
                {proof.contentHash}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">Similarity score</dt>
              <dd className="text-2xl font-bold text-white mt-1 font-[family-name:var(--font-display)]">
                {(proof.similarityScore * 100).toFixed(1)}%
              </dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard title="Decentralized storage" glow>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">IPFS CID</dt>
              <dd className="font-mono text-xs text-cyan-300/90 break-all mt-1">{proof.ipfsCid}</dd>
            </div>
            <a
              href={proof.ipfsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition"
            >
              View on IPFS <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {proof.blockchainTxHash && (
              <div>
                <dt className="text-slate-500 text-xs uppercase tracking-wider">Blockchain tx</dt>
                <dd className="font-mono text-xs text-emerald-300/80 break-all mt-1">{proof.blockchainTxHash}</dd>
              </div>
            )}
          </dl>
        </GlassCard>
      </div>

      {proof.similarityMatches?.length > 0 && (
        <GlassCard title="Similarity matches" glow>
          <ul className="space-y-2 text-sm">
            {proof.similarityMatches.map((m, i) => (
              <li
                key={i}
                className="flex justify-between rounded-lg px-3 py-2 bg-amber-500/5 border border-amber-500/20 text-slate-300"
              >
                <span>{m.title || "Unknown"}</span>
                <span className="text-amber-400 font-medium">{(m.score * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {proof.certificateId && (
        <Button variant="ghost" onClick={() => downloadCert(proof.certificateId)}>
          Download existing certificate
        </Button>
      )}
    </motion.div>
  );
}
