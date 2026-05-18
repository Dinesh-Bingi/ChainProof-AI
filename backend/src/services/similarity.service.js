import fs from "fs/promises";
import { Proof } from "../models/Proof.js";
import { config } from "../config/index.js";
import { hashBuffer } from "../utils/hash.js";
import { scoreWithEmbeddings } from "./ai.service.js";

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
  "text/html",
  "application/javascript",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function buildNgrams(tokens, n = 3) {
  const grams = new Set();
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.add(tokens.slice(i, i + n).join(" "));
  }
  return grams;
}

function jaccardSimilarity(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

async function extractText(filePath, mimeType) {
  if (!TEXT_TYPES.has(mimeType)) {
    const buf = await fs.readFile(filePath);
    return { text: null, fingerprint: hashBuffer(buf), isText: false };
  }
  const text = await fs.readFile(filePath, "utf8");
  return { text, fingerprint: null, isText: true };
}

export async function buildTextSample({ text, title, description }) {
  if (text) return text.slice(0, 8000);
  return `${title} ${description || ""}`.trim().slice(0, 8000);
}

async function checkSimilarityHeuristic({ content, isText, contentHash, excludeProofId }) {
  const queryGrams = isText ? buildNgrams(tokenize(content)) : new Set([content]);

  const existingProofs = await Proof.find({
    ...(excludeProofId && { _id: { $ne: excludeProofId } }),
  })
    .select("title description contentHash contentTextSample")
    .lean();

  const matches = [];
  let maxScore = 0;

  for (const proof of existingProofs) {
    if (proof.contentHash === contentHash) {
      matches.push({ proofId: proof._id, score: 1, title: proof.title });
      maxScore = 1;
      continue;
    }

    if (!isText && !proof.contentTextSample) continue;

    const sampleText = proof.contentTextSample || `${proof.title} ${proof.description || ""}`;
    const grams = buildNgrams(tokenize(sampleText));
    const score = isText ? jaccardSimilarity(queryGrams, grams) : 0;
    if (score >= 0.3) {
      matches.push({ proofId: proof._id, score, title: proof.title });
      maxScore = Math.max(maxScore, score);
    }
  }

  return finalizeSimilarity(matches, maxScore);
}

function finalizeSimilarity(matches, maxScore) {
  const uniqueMatches = dedupeMatches(matches).sort((a, b) => b.score - a.score).slice(0, 5);
  const plagiarismFlagged = maxScore >= config.ai.plagiarismFlagThreshold;

  return {
    similarityScore: Math.round(maxScore * 1000) / 1000,
    plagiarismFlagged,
    similarityMatches: uniqueMatches,
    status:
      plagiarismFlagged || maxScore >= config.ai.similarityThreshold ? "flagged" : "verified",
    engine: "ngram-jaccard",
  };
}

export async function checkSimilarity({ filePath, mimeType, contentHash, excludeProofId, title, description }) {
  const { text, fingerprint, isText } = await extractText(filePath, mimeType);
  const content = isText ? text : fingerprint;

  const existingProofs = await Proof.find({
    ...(excludeProofId && { _id: { $ne: excludeProofId } }),
  })
    .select("title description contentHash contentTextSample")
    .lean();

  const queryText = isText ? text : await buildTextSample({ title, description });
  const candidates = existingProofs
    .filter((p) => p.contentHash !== contentHash)
    .map((p) => ({
      proofId: p._id,
      title: p.title,
      text: p.contentTextSample || `${p.title} ${p.description || ""}`,
    }));

  const aiResult = await scoreWithEmbeddings({
    text: queryText,
    candidates,
    threshold: config.ai.similarityThreshold,
    plagiarismThreshold: config.ai.plagiarismFlagThreshold,
  });

  if (aiResult) {
    return {
      ...aiResult,
      contentTextSample: isText ? text.slice(0, 8000) : queryText,
    };
  }

  const heuristic = await checkSimilarityHeuristic({
    content,
    isText,
    contentHash,
    excludeProofId,
  });
  return {
    ...heuristic,
    contentTextSample: isText ? text.slice(0, 8000) : queryText,
  };
}

function dedupeMatches(matches) {
  const map = new Map();
  for (const m of matches) {
    const key = m.proofId.toString();
    const prev = map.get(key);
    if (!prev || m.score > prev.score) map.set(key, m);
  }
  return [...map.values()];
}
