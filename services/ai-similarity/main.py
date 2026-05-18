"""
ChainProof AI — similarity scoring microservice (sentence-transformers + cosine similarity).
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_NAME = os.getenv("AI_MODEL_NAME", "all-MiniLM-L6-v2")
_model = None


def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(MODEL_NAME)
    return _model


@asynccontextmanager
async def lifespan(_app: FastAPI):
    get_model()
    yield


app = FastAPI(
    title="ChainProof AI Similarity Service",
    version="1.0.0",
    lifespan=lifespan,
)


class Candidate(BaseModel):
    id: str
    text: str
    title: Optional[str] = None


class SimilarityRequest(BaseModel):
    text: str = Field(..., min_length=1)
    candidates: list[Candidate] = Field(default_factory=list)
    threshold: float = Field(0.85, ge=0, le=1)
    plagiarism_threshold: float = Field(0.92, ge=0, le=1)


class MatchResult(BaseModel):
    id: str
    score: float
    title: Optional[str] = None


class SimilarityResponse(BaseModel):
    similarity_score: float
    plagiarism_flagged: bool
    status: str
    matches: list[MatchResult]
    engine: str = "sentence-transformers"


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/api/v1/similarity", response_model=SimilarityResponse)
def score_similarity(body: SimilarityRequest):
    if not body.candidates:
        return SimilarityResponse(
            similarity_score=0.0,
            plagiarism_flagged=False,
            status="verified",
            matches=[],
        )

    try:
        model = get_model()
        query_emb = model.encode([body.text], normalize_embeddings=True)
        texts = [c.text for c in body.candidates]
        cand_emb = model.encode(texts, normalize_embeddings=True)
        scores = np.dot(cand_emb, query_emb.T).flatten()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    matches = []
    max_score = 0.0
    for cand, score in zip(body.candidates, scores):
        s = float(round(float(score), 4))
        max_score = max(max_score, s)
        if s >= 0.3:
            matches.append(MatchResult(id=cand.id, score=s, title=cand.title))

    matches.sort(key=lambda m: m.score, reverse=True)
    matches = matches[:5]
    plagiarism = max_score >= body.plagiarism_threshold
    status = "flagged" if plagiarism or max_score >= body.threshold else "verified"

    return SimilarityResponse(
        similarity_score=round(max_score, 4),
        plagiarism_flagged=plagiarism,
        status=status,
        matches=matches,
    )
