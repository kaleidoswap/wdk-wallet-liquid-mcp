# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /workspace

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && npm prune --omit=dev

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim
WORKDIR /app

COPY --from=builder /workspace/dist ./dist/
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/node_modules ./node_modules/

EXPOSE 3013

ENV PORT=3013
ENV LIQUID_NETWORK=testnet
# LIQUID_MNEMONIC must be set at runtime.

CMD ["node", "dist/index.js"]
