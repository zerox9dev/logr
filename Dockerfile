# =============================================================================
# logr — Multi-stage Dockerfile (Next.js standalone output)
# Requires: Node 22-alpine, next.config output: "standalone"
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: deps — install production + dev dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Install libc compat for Alpine + native modules
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: build — compile the Next.js app
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Provide placeholder defaults so a bare `docker build .` succeeds even
# without real values; override with actual secrets at build time via
# --build-arg (or via docker-compose build args).
ARG NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Disable Next.js telemetry inside Docker
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: runner — minimal production image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static files served by the standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is emitted by Next.js standalone output into the root of .next/standalone
CMD ["node", "server.js"]
