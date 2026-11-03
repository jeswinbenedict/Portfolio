# Docker — Images, Layers and the Dockerfile

---

## 1. The problem containers solve

To run this portfolio you normally need Node.js at the right version, a
dependency tree installed, and a build step run. Any of those differing
between your laptop and a server produces "works on my machine".

A **container** packages the application *together with its runtime and
dependencies* into one artifact. The server needs only Docker — no Node, no
`npm install`, no build.

**Container vs virtual machine.** A VM virtualises hardware and boots a whole
guest OS — gigabytes, tens of seconds to start. A container shares the host
kernel and isolates only the process, filesystem and network — megabytes,
milliseconds to start. That is why 265 MB and an instant start is normal for
a container and impossible for a VM.

---

## 2. Images vs containers

| | What it is |
|---|---|
| **Image** | A read-only template. Built once, never changes. |
| **Container** | A running instance of an image, with a thin writable layer on top. |

One image, many containers — we ran two simultaneously on ports 3000 and 3100
from the same image. Crucially, **an image is immutable**: editing source code
afterwards cannot change an image that was already built. That is why the v2
image still carried the `v2 · Dockerized` badge after we reverted it in Git.

---

## 3. Layers and the build cache

Every instruction creates a **layer** — a diff of filesystem changes. Layers
are content-addressed and cached: if an instruction and its inputs are
unchanged, Docker reuses the cached layer.

This drives the single most important Dockerfile habit:

```dockerfile
COPY package.json package-lock.json ./   # copy manifests FIRST
RUN npm ci                               # this layer is now cached
COPY . .                                 # source changes don't invalidate it
```

Reverse those and every one-character source edit re-runs `npm ci`. Our v2
build took seconds instead of a minute because only the final layers changed.

---

## 4. The Dockerfile, stage by stage

It is a **three-stage multi-stage build**. Stages 1 and 2 carry the compiler
and the full `node_modules`; only stage 3 ships. That is 265 MB instead of
roughly 1 GB.

### Stage 1 — deps

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
```

- **`node:20-alpine`** — Alpine Linux, ~5 MB base versus ~350 MB for Debian.
- **`AS deps`** — names the stage so later stages can copy from it.
- **`npm ci` not `npm install`** — `ci` installs the *exact* versions pinned in
  `package-lock.json` and fails if the lockfile is out of sync. `install` may
  silently bump versions, so two builds of the same commit could differ.

### Stage 2 — builder

```dockerfile
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
```

`COPY --from=deps` pulls the resolved dependency tree across instead of
reinstalling. `npm run build` emits `.next/standalone` because
`next.config.ts` sets `output: "standalone"` — Next traces which modules are
actually imported and writes a self-contained server. **This setting is what
makes the image small.**

### Stage 3 — runner

```dockerfile
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Four lines that matter most:**

| Line | Why it matters |
|---|---|
| `ENV HOSTNAME=0.0.0.0` | The default binds localhost *inside* the container, so `-p 3000:3000` would publish an unreachable port. Classic silent failure. |
| `COPY .next/static` separately | Hashed JS/CSS chunks are **not** part of the standalone output. Omit this and you get an unstyled page. |
| `USER nextjs` | Drops root. A compromised process is not root inside the container. |
| `CMD [...]` exec form | No shell wrapper, so Node is PID 1 and receives Docker's `SIGTERM` directly — clean shutdown. We saw exit code 143 (SIGTERM) on stop, which proves it. |

`addgroup` and `adduser` are chained in **one `RUN`** to produce one layer
instead of two. `--chown` during `COPY` avoids a separate `RUN chown` layer
that would duplicate the whole tree.

---

## 5. `.dockerignore`

Excludes files from the build context sent to the daemon:

```
node_modules    # reinstalled in the image
.next           # rebuilt in the image
.git            # history is not needed at runtime
.env            # SECRETS MUST NEVER ENTER A LAYER
```

The `.env` line is the serious one. **Layers are permanent** — a secret copied
in and deleted in a later instruction is still readable in the earlier layer
by anyone who pulls the image.

---

## 6. Commands you should be able to explain

```bash
docker build -t jeswin-portfolio:v2 .     # -t = name:tag, "." = build context
docker images                              # list local images
docker run -d --name portfolio -p 3000:3000 jeswin-portfolio:v2
docker ps                                  # running containers (-a for all)
docker logs portfolio                      # stdout/stderr
docker exec -it portfolio sh               # shell inside a running container
docker stop portfolio && docker rm portfolio
```

**`-p 3000:3000` is `host:container`.** `-p 3100:3000` publishes the same
container port on a different host port — which is how we ran two at once.

---

## 7. Proving independence from the host

```
HOST  node : v25.2.1   platform: MINGW64_NT (Windows 11)
IMAGE node : v20.20.2  platform: Linux (Alpine)
IMAGE user : nextjs    (non-root)
```

The host runs Node 25 on Windows; the container runs its own Node 20 on Linux
as an unprivileged user. Nothing on the laptop is used at runtime.

---

## 8. Registry: tags, digests and sizes

```bash
docker tag jeswin-portfolio:v2 jechuimmanuel/portfolio:v2
docker push jechuimmanuel/portfolio:v2
```

**Tagging copies nothing.** It adds a second name pointing at the same image
ID. `v2` and `latest` share a digest for exactly that reason.

Two numbers that look contradictory but are not:

| Where | Size | Why |
|---|---|---|
| `docker images` | 265 MB | uncompressed, on disk |
| Docker Hub | 60.62 MB | compressed layers, as transferred |

Similarly `595e69fc8d0e` on Hub vs `a9a6c16a7882` locally: the first is the
per-platform manifest digest, the second the multi-platform index digest.
Different levels of the same manifest, not different images.

---

## 9. Common failures

| Symptom | Cause |
|---|---|
| Page loads but unstyled | `.next/static` not copied |
| `-p` seems to do nothing | `HOSTNAME` not set to `0.0.0.0` |
| Rebuild always slow | Source copied before `npm ci` |
| `port is already allocated` | `docker rm -f <name>`, or use a different host port |
| Image much larger than expected | Single-stage build shipping the toolchain |
