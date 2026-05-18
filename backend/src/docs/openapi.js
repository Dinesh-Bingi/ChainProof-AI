export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "ChainProof AI API",
    version: "1.0.0",
    description:
      "Production API for IP ownership proofs: MongoDB, Pinata IPFS, blockchain anchoring, and AI similarity.",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { 200: { description: "OK" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register with email/password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" }, 409: { description: "Email taken" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "OK" } },
      },
    },
    "/auth/firebase": {
      post: {
        tags: ["Auth"],
        summary: "Exchange Firebase ID token for app JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["idToken"],
                properties: { idToken: { type: "string" }, name: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "OK" } },
      },
    },
    "/proofs/dashboard": {
      get: {
        tags: ["Proofs"],
        summary: "Dashboard analytics",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Analytics payload" } },
      },
    },
    "/proofs": {
      get: {
        tags: ["Proofs"],
        summary: "List proofs",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" } },
      },
      post: {
        tags: ["Proofs"],
        summary: "Upload and register proof",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "title"],
                properties: {
                  file: { type: "string", format: "binary" },
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/verify/hash": {
      post: {
        tags: ["Verify"],
        summary: "Verify ownership by content hash",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Verification result" } },
      },
    },
    "/blockchain/status": {
      get: {
        tags: ["Blockchain"],
        summary: "Blockchain network status",
        responses: { 200: { description: "Status" } },
      },
    },
    "/blockchain/transactions": {
      get: {
        tags: ["Blockchain"],
        summary: "User on-chain transaction history",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Transactions" } },
      },
    },
  },
};
