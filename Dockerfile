FROM node:20-bookworm-slim

# System dependencies for Prisma (openssl), DuckDB native C++ bindings (libstdc++6), and Bun
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates libstdc++6 \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g bun

WORKDIR /app

# Install dependencies cleanly
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source
COPY . .

# Production build configuration (apply 4GB heap limit strictly to build step)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/db/custom.db"

# Ensure healthy SQLite DB, generate Prisma client, and compile Webpack standalone output
RUN NODE_OPTIONS="--max-old-space-size=4096" sh -c "bun run db:health && bun run build"

# Ensure native Prisma & DuckDB modules are available inside standalone bundle
RUN mkdir -p .next/standalone/node_modules .next/standalone/db \
    && cp -r node_modules/.prisma .next/standalone/node_modules/.prisma 2>/dev/null || true \
    && cp -r node_modules/duckdb .next/standalone/node_modules/duckdb 2>/dev/null || true \
    && cp -r node_modules/@mapbox .next/standalone/node_modules/@mapbox 2>/dev/null || true \
    && chmod -R a+rX /app \
    && chmod -R 777 /app/db /app/.next/standalone/db

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV HOME="/tmp"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/db-health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "--smol", ".next/standalone/server.js"]
