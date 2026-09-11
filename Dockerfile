FROM node:20-alpine

# NOTE: This root-level Dockerfile predates the documented per-service Railway
# setup in docs/RAILWAY_DEPLOYMENT.md, which explicitly configures the
# `axiom-web` service to build `apps/axiom-freedom/Dockerfile`, not this file.
# This copy was found out of sync (missing several pages added after the
# "Add protected automation console" commit) during a full repository review.
# It has been re-synced with apps/axiom-freedom/Dockerfile as a safety net in
# case any Railway service still resolves the Dockerfile at the repository
# root by default. An operator with Railway dashboard access should confirm
# whether any service still depends on this file; if not, it and railway.toml
# should be removed to avoid future drift between the two copies.

WORKDIR /app

COPY apps/axiom-freedom/package.json ./
COPY apps/axiom-freedom/package-lock.json ./
RUN npm ci --omit=dev

COPY apps/axiom-freedom/server.js ./
COPY apps/axiom-freedom/index.html ./
COPY apps/axiom-freedom/axescontracting.html ./
COPY apps/axiom-freedom/library.html ./
COPY apps/axiom-freedom/axiom_web_interface.html ./
COPY apps/axiom-freedom/automation.html ./
COPY apps/axiom-freedom/command-center.html ./
COPY apps/axiom-freedom/origin-continuity.html ./
COPY apps/axiom-freedom/support.html ./
COPY apps/axiom-freedom/materials.html ./
COPY apps/axiom-freedom/widget.js ./
COPY PROJECT_TIMELINE.md ./
COPY docs ./docs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
