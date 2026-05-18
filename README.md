# ChainProof AI

Production-ready full-stack application for intellectual property ownership verification using **MongoDB**, **IPFS (Pinata)**, **Solidity/Hardhat**, and **AI similarity detection**.

## Architecture

```
chainproof-ai/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + MongoDB + JWT
├── blockchain/        # Solidity + Hardhat + Ethers.js
├── docker-compose.yml
└── .env.example
```

### Flow

1. User uploads a file → SHA-256 content hash generated
2. File pinned to IPFS via Pinata
3. AI module runs n-gram Jaccard similarity against existing proofs
4. Hash registered on `ChainProofRegistry` smart contract
5. PDF ownership certificate issued for verified proofs
6. All actions logged in activity history

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Pinata API keys (optional in dev — mock CID used)
- Hardhat local node for blockchain (optional in dev)

## Quick start

```bash
# Install all workspaces
npm install

# Copy environment
cp .env.example .env

# Terminal 1 — MongoDB (Docker)
docker compose up mongodb -d

# Terminal 2 — Blockchain
npm run node -w blockchain
npm run deploy:contracts -w blockchain

# Terminal 3 — Backend
npm run dev -w backend

# Terminal 4 — Frontend
npm run dev -w frontend
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/v1
- Health: http://localhost:5000/health

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login (JWT) |
| GET | `/auth/me` | Current user |
| GET | `/proofs/dashboard` | Dashboard stats |
| POST | `/proofs` | Upload & register proof |
| GET | `/proofs/:id` | Proof details |
| POST | `/verify/hash` | Verify by content hash |
| POST | `/verify/file` | Verify by file upload |
| POST | `/certificates/:proofId` | Issue PDF certificate |
| GET | `/history` | Activity log |

## Environment variables

See [.env.example](.env.example). Required for production:

- `MONGODB_URI`, `JWT_SECRET`
- `PINATA_API_KEY`, `PINATA_SECRET_API_KEY`
- `BLOCKCHAIN_RPC_URL`, `CHAINPROOF_CONTRACT_ADDRESS`, `BLOCKCHAIN_PRIVATE_KEY`

## Docker production

```bash
cp .env.example .env
# Fill in production values
docker compose up --build
```

## Smart contract

`ChainProofRegistry` stores `contentHash → { owner, ipfsCid, title, registeredAt }`.

Deploy:

```bash
npm run deploy:contracts -w blockchain
```

Address is written to `backend/src/config/contract-address.json`.

## License

MIT
