# syntax=docker/dockerfile:1

###############################################################
# Stage 1 — deps : install dependencies from the lockfile only
###############################################################
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only the manifests first so this layer is cached and is
# re-run ONLY when dependencies actually change (not on code edits).
COPY package.json package-lock.json ./

# `npm ci` installs the exact versions pinned in package-lock.json,
# giving a reproducible build (unlike `npm install`, which may bump).
RUN npm ci

###############################################################
# Stage 2 — builder : compile the Next.js production bundle
###############################################################
FROM node:20-alpine AS builder
WORKDIR /app

# Reuse the dependency layer resolved above.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js anonymous telemetry inside CI/containers.
ENV NEXT_TELEMETRY_DISABLED=1

# Produces .next/standalone (a self-contained Node server with only
# the modules actually imported) because next.config.ts sets
# `output: "standalone"`. This is what keeps the runtime image small.
RUN npm run build

###############################################################
# Stage 3 — runner : minimal runtime image (no build toolchain)
###############################################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bind to every interface so the port is reachable from outside
# the container; the default (localhost) would only be visible
# to processes inside the container itself.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Run as an unprivileged user instead of root (defence in depth).
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Static assets served directly by the Node server.
COPY --from=builder /app/public ./public

# The standalone output already contains server.js + node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Hashed JS/CSS chunks are NOT part of standalone and must be added.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Documents the port the app listens on (published via -p at runtime).
EXPOSE 3000

# Direct `node` exec form: no shell wrapper, so the process is PID 1
# and receives Docker's SIGTERM for a clean shutdown.
CMD ["node", "server.js"]
