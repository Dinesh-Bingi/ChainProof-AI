import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

export function isAiServiceEnabled() {
  return Boolean(config.ai.serviceUrl);
}

export async function scoreWithEmbeddings({ text, candidates, threshold, plagiarismThreshold }) {
  if (!isAiServiceEnabled() || !text?.trim()) return null;

  const url = `${config.ai.serviceUrl.replace(/\/$/, "")}/api/v1/similarity`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.ai.serviceTimeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        candidates: candidates.map((c) => ({
          id: c.proofId?.toString() || c.id,
          text: c.text,
          title: c.title,
        })),
        threshold,
        plagiarism_threshold: plagiarismThreshold,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      logger.warn("AI similarity service error", detail);
      return null;
    }

    const data = await response.json();
    return {
      similarityScore: data.similarity_score,
      plagiarismFlagged: data.plagiarism_flagged,
      similarityMatches: data.matches.map((m) => ({
        proofId: m.id,
        score: m.score,
        title: m.title,
      })),
      status: data.status,
      engine: data.engine || "sentence-transformers",
    };
  } catch (err) {
    logger.warn("AI similarity service unreachable", err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkAiServiceHealth() {
  if (!isAiServiceEnabled()) return { available: false };
  try {
    const res = await fetch(`${config.ai.serviceUrl.replace(/\/$/, "")}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { available: false };
    const data = await res.json();
    return { available: true, ...data };
  } catch {
    return { available: false };
  }
}
