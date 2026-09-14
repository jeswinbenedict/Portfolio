# Docker Containerization — Lab Report

**Student:** Jeswin Karunya Benedict
**Lab:** Docker Containerization (Q1 Containerize · Q2 Version & Redeploy · Q3 Push & Redeploy)

---

## 1. Application Name

**Jeswin Karunya Benedict — Developer Portfolio**

A personal developer portfolio web application (neo-brutalist design) with light/dark
theming, scroll-driven animations, and a privacy-respecting analytics API. This is the
same web application built in the previous lab; it has been containerized here without
changing its behaviour.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.0 (App Router, React Server Components) |
| UI Library | React 19.2.8 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Icons | Lucide React, Simple Icons |
| Animation | Framer Motion |
| Backend API | Next.js Route Handlers (`/api/analytics/*`) |
| Data Store | Upstash Redis (optional; in-memory fallback) |
| Email | Resend (optional) |
| Runtime (container) | Node.js 20 LTS on Alpine Linux |
| Base Image | `node:20-alpine` |
| Container Engine | Docker 29.7.2 (Docker Desktop, WSL2 backend) |

> The app runs without any environment variables: every secret is read lazily at request
> time, and the analytics layer falls back to in-memory storage when Redis is not configured.
> This is what makes the image self-contained.

---

## 3. Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

###############################################################
# Stage 1 — deps : install dependencies from the lockfile only
###############################################################
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

###############################################################
# Stage 2 — builder : compile the Next.js production bundle
###############################################################
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

###############################################################
# Stage 3 — runner : minimal runtime image (no build toolchain)
###############################################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
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

---

## 4. Explanation of Each Important Instruction

This is a **three-stage multi-stage build**. Stages 1 and 2 contain the compiler and the
full `node_modules` tree; only stage 3 is shipped. That is why the final image is **265 MB**
instead of roughly 1 GB.

| Instruction | Purpose |
|---|---|
| `# syntax=docker/dockerfile:1` | Opts into the current BuildKit frontend so modern Dockerfile features and better caching are available. |
| `FROM node:20-alpine AS deps` | Starts the dependency stage from Alpine Linux (~5 MB base) with Node 20 LTS. `AS deps` names the stage so later stages can copy from it. |
| `WORKDIR /app` | Sets `/app` as the working directory and creates it. Every later relative path resolves from here. |
| `COPY package.json package-lock.json ./` | Copies **only the manifests** before the source. Docker caches each layer, so this dependency layer is rebuilt *only when dependencies change* — editing a component does not trigger a reinstall. |
| `RUN npm ci` | Installs the exact versions pinned in `package-lock.json`. Unlike `npm install`, it never silently upgrades a package, so the build is **reproducible**. |
| `FROM node:20-alpine AS builder` | Begins a fresh stage for compilation. |
| `COPY --from=deps /app/node_modules ./node_modules` | Pulls the already-resolved dependency tree from the previous stage instead of installing again. |
| `COPY . .` | Copies the application source. `.dockerignore` excludes `node_modules`, `.next`, `.git` and all `.env` files, so secrets are never baked into a layer. |
| `ENV NEXT_TELEMETRY_DISABLED=1` | Turns off Next.js anonymous telemetry — appropriate for CI and containers. |
| `RUN npm run build` | Runs `next build`. Because `next.config.ts` sets `output: "standalone"`, Next emits `.next/standalone` — a self-contained server bundling only the modules actually imported. |
| `FROM node:20-alpine AS runner` | The final, shipped stage. It contains **no compiler, no dev-dependencies, no source code** — only the built output. |
| `ENV NODE_ENV=production` | Puts React and Next into production mode (no dev warnings, optimized rendering). |
| `ENV HOSTNAME=0.0.0.0` | **Critical for containers.** Binds the server to every interface. The default (`localhost`) would only be reachable from *inside* the container, so `-p 3000:3000` would appear to do nothing. |
| `ENV PORT=3000` | Tells the standalone server which port to listen on. |
| `RUN addgroup … && adduser …` | Creates an unprivileged `nextjs` user. Both commands are chained in **one `RUN`** so they produce a single layer. |
| `COPY --from=builder /app/public ./public` | Brings in static assets (images, favicon) served directly by the Node server. |
| `COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./` | Copies the standalone server (`server.js` + its minimal `node_modules`). `--chown` sets ownership during the copy, avoiding an extra `RUN chown` layer. |
| `COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static` | The hashed JS/CSS chunks are **not** included in `standalone` and must be copied separately — omitting this yields an unstyled page. |
| `USER nextjs` | Drops root privileges for everything that follows. Defence in depth: a compromised process is not root inside the container. |
| `EXPOSE 3000` | Documents the listening port as image metadata. It does **not** publish the port — `-p` at `docker run` does that. |
| `CMD ["node", "server.js"]` | The start command in **exec form** (no shell wrapper), so Node is PID 1 and receives Docker's `SIGTERM` directly for a clean shutdown. |

### Supporting file — `.dockerignore`

```
node_modules      # reinstalled inside the image
.next             # rebuilt inside the image
out
.git              # VCS history is not needed at runtime
.env              # secrets must never enter an image layer
.env.local
*.log
docker-lab        # lab docs & screenshots, not app code
```

---

## 5. Docker Build Command

**Version 1**

```bash
docker build -t jeswin-portfolio:v1 .
```

**Version 2**

```bash
docker build -t jeswin-portfolio:v2 .
```

`-t` names and tags the image; `.` is the build context (the directory sent to the daemon,
filtered by `.dockerignore`).

---

## 6. Docker Run Command

```bash
docker run -d --name portfolio-v2 -p 3000:3000 jeswin-portfolio:v2
```

| Flag | Meaning |
|---|---|
| `-d` | Detached — run in the background and return the container ID. |
| `--name portfolio-v2` | A stable, human-readable container name for `stop` / `rm` / `logs`. |
| `-p 3000:3000` | Publishes **host port 3000 → container port 3000**, making the app reachable from the host browser. |
| `jeswin-portfolio:v2` | The image (and tag) to instantiate. |

---

## 7. Docker Image Name and Version

| Image | Tag | Image ID | Size |
|---|---|---|---|
| `jeswin-portfolio` | `v1` | `67f4ff90ee33` | 265 MB |
| `jeswin-portfolio` | `v2` | `a9a6c16a7882` | 265 MB |
| `jechuimmanuel/portfolio` | `v1` | `67f4ff90ee33` | 265 MB |
| `jechuimmanuel/portfolio` | `v2`, `latest` | `a9a6c16a7882` | 265 MB |

The `jechuimmanuel/*` tags are the same images re-tagged with the Docker Hub namespace —
tagging does not copy data, it only adds a name pointing at the same image ID.

---

## 8. Docker Hub Repository

**Repository:** `docker.io/jechuimmanuel/portfolio`
**URL:** https://hub.docker.com/r/jechuimmanuel/portfolio

Tag and push:

```bash
docker tag jeswin-portfolio:v2 jechuimmanuel/portfolio:v2
docker login -u jechuimmanuel
docker push jechuimmanuel/portfolio:v2
```

---

## 9. Application URL

| Environment | URL |
|---|---|
| Local container (host machine) | http://localhost:3000 |
| Container, second instance | http://localhost:3100 |
| Local VM (bridged networking) | `http://<VM-IP>:3000` |

---

## 10. Changes Made in Version v2

**File changed:** `components/Navbar.tsx`

A **version badge** was added to the navigation bar, immediately to the right of the `JKB`
brand logo. It renders as a mint-green neo-brutalist pill reading **`v2 · Dockerized`**,
matching the site's existing border/shadow design language.

```jsx
{/* Custom Brand Logo + Release Badge */}
<div className="flex items-center gap-2">
  <LogoMark />
  {/* Version badge — introduced in the Dockerized v2 release */}
  <span
    title="Running the v2 container image"
    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-neo-mint
               text-neo-black font-mono font-extrabold text-[11px] leading-none
               border-2 border-neo-black shadow-neo-sm rounded-lg whitespace-nowrap"
  >
    v2 · Dockerized
  </span>
</div>
```

**Why this change:** it is visible immediately on page load without scrolling, in both light
and dark themes, which makes the v1 → v2 difference unambiguous in a screenshot. It is
hidden below the `sm` breakpoint (`hidden sm:inline-flex`) so the mobile navbar does not wrap.

> **Note on the repository state.** The badge is a lab marker, not a feature of the live
> portfolio, so it was reverted on `main` after the `v2` image had been built and captured.
> The `v2` image (`a9a6c16a7882`) and the copy of the application in `source-code/` both
> still contain it — that is the code the image was built from. To rebuild an identical
> `v2` image from the repository, re-apply the snippet above to `components/Navbar.tsx`,
> or build from `source-code/` instead.

**Verification that v2 is actually being served** (not a cached v1):

```
$ curl -s http://localhost:3000 | grep -o "v2 · Dockerized"
v2 · Dockerized
```

### Redeployment sequence performed

```
$ docker stop portfolio-v1
portfolio-v1

$ docker rm portfolio-v1
portfolio-v1

$ docker run -d --name portfolio-v2 -p 3000:3000 jeswin-portfolio:v2
79000b90067a8993a30ff95cb923a59836438bd171af7478338101b2a2af08bb
```

---

## 11. VM Deployment Details

**Target:** local Linux VM (VirtualBox / VMware) — see status note in §14.

### Step 1 — Prepare the VM

Ubuntu Server 22.04 LTS, 2 vCPU, 2 GB RAM, **Bridged Adapter** networking so the VM gets
its own LAN IP and the host browser can reach it.

### Step 2 — Install Docker on the VM

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
docker --version
```

Log out and back in after `usermod` so the new group membership takes effect.

### Step 3 — Find the VM's IP address

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### Step 4 — Pull the v2 image from Docker Hub

```bash
docker pull jechuimmanuel/portfolio:v2
```

No source code, no Node.js and no `npm install` are needed on the VM — the image already
contains the compiled application and its runtime.

### Step 5 — Run the container on the VM

```bash
docker run -d --name portfolio --restart unless-stopped -p 3000:3000 jechuimmanuel/portfolio:v2
```

`--restart unless-stopped` brings the app back automatically after a VM reboot.

### Step 6 — Open the firewall (if `ufw` is enabled)

```bash
sudo ufw allow 3000/tcp
```

### Step 7 — Access and verify

From the **host** browser: `http://<VM-IP>:3000` (for example `http://192.168.1.42:3000`).

Confirm it is the v2 build:

```bash
curl -s http://localhost:3000 | grep -o "v2 · Dockerized"
docker ps
```

The `v2 · Dockerized` badge next to the logo confirms the modified version is deployed.

---

## 12. Verification — Independence from the Host Environment

The container does not rely on anything installed on the host. Measured directly:

```
HOST  node : v25.2.1        | platform: MINGW64_NT-10.0-26200   (Windows 11)
IMAGE node : v20.20.2       | platform: Linux                   (Alpine)
IMAGE user : nextjs                                             (non-root)
```

The host runs **Node 25 on Windows**; the container runs its own **Node 20 on Linux** as an
unprivileged user. The application is executed entirely by the runtime baked into the image.

Two instances of the same image were also run simultaneously on different host ports,
demonstrating process and network isolation:

```
port 3000 -> 200    port 3100 -> 200
```

---

## 13. Screenshots

| File | Shows |
|---|---|
| `screenshots/browser-v1.png` | **v1** running in the browser from the container — navbar shows the `JKB` logo only. |
| `screenshots/browser-v2.png` | **v2** running in the browser — navbar now shows the `v2 · Dockerized` badge. |
| `screenshots/docker-build.png` | `docker build` output ending in a successful image export. |
| `screenshots/docker-images.png` | `docker images` listing the v1, v2 and Docker Hub-tagged images. |
| `screenshots/docker-ps.png` | `docker ps` showing the running container and the `0.0.0.0:3000->3000/tcp` port mapping. |
| `screenshots/dockerhub.png` | The `jechuimmanuel/portfolio` repository on Docker Hub after the push. |

Raw command output is also preserved as text in `logs/` for reference.

---

## 14. Status of Each Lab Task

| # | Task | Status |
|---|---|---|
| Q1 | Dockerfile written | Done |
| Q1 | Image built (`v1`) | Done — `67f4ff90ee33`, 265 MB |
| Q1 | Container run & reachable in browser | Done — HTTP 200 on `localhost:3000` |
| Q1 | Independence from host verified | Done — see §12 |
| Q2 | Visible UI change made | Done — `v2 · Dockerized` badge |
| Q2 | Image rebuilt as `v2` | Done — `a9a6c16a7882` |
| Q2 | Old container stopped & removed | Done |
| Q2 | New `v2` container running & verified | Done — badge present in served HTML |
| Q3 | Image tagged for Docker Hub | Done — `jechuimmanuel/portfolio:v2` |
| Q3 | Image pushed to Docker Hub | **Pending** — requires `docker login` (credentials entered by the student) |
| Q3 | Pulled & run on VM | **Pending** — requires the local VM to be running; commands in §11 |

---

## 15. Brief Explanation of the Complete Process

**Containerization.** The portfolio is a Next.js application that normally needs Node.js,
a dependency tree and a build step before it can run. Containerization packages all three —
runtime, dependencies and compiled output — into a single immutable image, so the app runs
identically anywhere Docker runs.

The Dockerfile uses a **three-stage build**. The first stage installs dependencies from the
lockfile; the second compiles the production bundle; the third copies *only* the compiled
output onto a clean Alpine + Node 20 base. The compiler, dev-dependencies and source code
are discarded with the intermediate stages, which is why the shipped image is 265 MB rather
than roughly a gigabyte. Setting `output: "standalone"` in `next.config.ts` is what makes
this possible: Next traces the modules actually imported and emits a self-contained server.

**Building and running.** `docker build -t jeswin-portfolio:v1 .` sends the build context
(filtered by `.dockerignore`) to the daemon and executes each instruction as a cached layer.
`docker run -d -p 3000:3000` then starts a container and publishes the container's port 3000
onto the host, making the site reachable at `http://localhost:3000`.

**Versioning.** For v2, a visible `v2 · Dockerized` badge was added to the navbar. Rebuilding
with `-t jeswin-portfolio:v2` produced a *new, separate* image — v1 remains untouched and
could be rolled back to instantly. Because only `Navbar.tsx` changed, Docker reused the cached
dependency layers and only the final layers were rebuilt. The old container was then stopped
and removed, and a new one created from the v2 image on the same port.

**Distribution.** `docker tag` adds a Docker Hub–namespaced name (`jechuimmanuel/portfolio:v2`)
pointing at the same image ID, and `docker push` uploads the layers to the registry. On the VM,
`docker pull` fetches exactly those layers and `docker run` starts the identical application —
no source code, no Node.js installation and no build step on the target machine. This
build-once / run-anywhere property is the central benefit demonstrated by this lab.
