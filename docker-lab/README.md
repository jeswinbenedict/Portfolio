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
docker push jechuimmanuel/portfolio:latest
```

### Push result — all three tags are live

| Tag | Registry digest | OS/ARCH | Compressed size |
|---|---|---|---|
| `v2` | `595e69fc8d0e` | linux/amd64 | 60.62 MB |
| `latest` | `595e69fc8d0e` | linux/amd64 | 60.62 MB |
| `v1` | `6259f2f38c78` | linux/amd64 | 60.62 MB |

`v2` and `latest` share a digest because both names point at the same image.

The registry reports **60.62 MB** while `docker images` reports **265 MB**: the registry
figure is the *compressed* size of the layers as transferred, the local figure is the
*uncompressed* size on disk. Both describe the same image.

Verified by deleting the local copy and pulling it back from the registry:

```
$ docker rmi jechuimmanuel/portfolio:v2
$ docker pull jechuimmanuel/portfolio:v2
Digest: sha256:a9a6c16a7882772d346cbdbf0d076dd13fd2d3d7da9196ad5c8f05edf8f3df42
Status: Downloaded newer image for jechuimmanuel/portfolio:v2
```

> The digest shown on the Docker Hub tags page (`595e69fc8d0e`) is the per-platform
> manifest digest, whereas `a9a6c16a7882` is the digest of the multi-platform index that
> `docker images` displays locally. They refer to the same image from different levels of
> the manifest.

---

## 9. Application URL

| Environment | URL | Verified |
|---|---|---|
| **AWS EC2 VM, by public IP, over the internet** | **http://56.228.18.13:3000** | **200** |
| Local container (host machine) | http://localhost:3000 | 200 |
| Container, second instance | http://localhost:3100 | 200 |
| WSL VM container, from the Windows host | http://localhost:3200 | 200 |
| WSL VM container, by the VM's own IP, from inside the VM | http://172.18.129.67:3200 | 200 |
| WSL VM container, by the VM's IP, from the Windows host | `http://172.18.129.67:3200` | blocked — see §11.B |

The AWS URL is the one that satisfies the lab's "access using the VM's IP address and
appropriate port" requirement: it is a public IPv4 address reached over the internet from a
separate machine, with no tunnelling or port forwarding.

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

> **Note.** This badge was reverted on the `main` branch after the `v2` image was built and
> captured, so that a lab marker does not appear on the deployed portfolio. The image and the
> `source-code/` copy in this submission both still contain it — see §14 for details.

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

The image was deployed to **two** separate VMs. **A** is an AWS EC2 cloud instance and is the
primary result — it satisfies every part of the requirement including public-IP access.
**B** is a local WSL 2 VM, kept because it demonstrates the same workflow on-premises.

---

## 11.A — Primary: AWS EC2 (cloud VM)

**Instance:** `t3.micro` · 2 vCPU · 908 MB RAM · Ubuntu 26.04 LTS · **Public IPv4 `56.228.18.13`**

A genuinely separate machine in an AWS data centre, with no source code, no Node.js and an
empty Docker engine. The only way the application could run there was by pulling the
published image from Docker Hub.

### Steps performed

```bash
# 1 — connect to the instance
ssh -i docker-lab.pem ubuntu@56.228.18.13

# 2 — install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo systemctl enable --now docker

# 3 — pull the published image from Docker Hub
sudo docker pull jechuimmanuel/portfolio:v2

# 4 — run it
sudo docker run -d --name portfolio --restart unless-stopped \
  -p 3000:3000 jechuimmanuel/portfolio:v2
```

**Security group inbound rules** (EC2 → Security tab → Edit inbound rules):

| Type | Protocol | Port | Source |
|---|---|---|---|
| SSH | TCP | 22 | `0.0.0.0/0` |
| Custom TCP | TCP | 3000 | `0.0.0.0/0` |

Without the port 3000 rule the container is reachable only from inside the instance —
`docker-proxy` binds `0.0.0.0:3000` and `ufw` is inactive, so the security group is the only
thing gating external access.

### Result (`screenshots/aws-deploy.png`)

```
ubuntu@ip-56-228-18-13:~$ docker --version
Docker version 29.8.0, build 88096ef

ubuntu@ip-56-228-18-13:~$ docker pull jechuimmanuel/portfolio:v2
Digest: sha256:a9a6c16a7882772d346cbdbf0d076dd13fd2d3d7da9196ad5c8f05edf8f3df42

ubuntu@ip-56-228-18-13:~$ docker ps
CONTAINER ID   IMAGE                        STATUS         PORTS
8b38ba68de5a   jechuimmanuel/portfolio:v2   Up 6 minutes   0.0.0.0:3000->3000/tcp

ubuntu@ip-56-228-18-13:~$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
200
```

### Access by public IP, from a different machine over the internet

```
$ curl -s -o /dev/null -w "%{http_code}" http://56.228.18.13:3000
200

$ curl -s --compressed http://56.228.18.13:3000 | grep -o "v2 · Dockerized"
v2 · Dockerized
```

The browser capture is `screenshots/browser-aws.png`. The `v2 · Dockerized` badge confirms
the modified version is the one deployed, and the pulled digest `a9a6c16a7882` is identical
to the image pushed in §8 — the same bytes travelled laptop → Docker Hub → AWS.

> **Cost note.** `t3.micro` is free-tier eligible (750 h/month for 12 months). The instance
> should be **terminated** after the demonstration so it neither accrues charges nor leaves
> port 22 exposed.

---

## 11.B — Secondary: local WSL 2 VM

**Target used:** a local **Ubuntu VM running under WSL 2** (`172.18.129.67`).

WSL 2 is a real virtual machine — a Linux kernel (`6.6.87.2-microsoft-standard-WSL2`)
booted in a lightweight Hyper-V VM with its own filesystem, init system (systemd as PID 1)
and network interface. Docker Engine was installed *natively inside it*, independent of
Docker Desktop, so the deployment genuinely crosses a machine boundary:

| | Host (Windows) | VM (Ubuntu / WSL 2) |
|---|---|---|
| Docker | Docker Desktop **29.7.2** | Docker Engine **29.8.0** |
| Daemon root | Docker Desktop VM | `/var/lib/docker` |
| Images before the pull | `v1`, `v2`, … | **none — empty** |
| Source code present | yes | **no** |

The VM's engine started with **zero images and no source code**, so the only way the
application could run there was by pulling the published image from Docker Hub.

The instructions below work unchanged on a VirtualBox or VMware guest; only Step 1 differs.

### Step 1 — Prepare the VM

*As used here (WSL 2):*

```powershell
wsl --install -d Ubuntu     # if the distro does not exist yet
wsl -d Ubuntu
```

*For VirtualBox / VMware instead:* Ubuntu Server 22.04 LTS, 2 vCPU, 2 GB RAM, with
**Bridged Adapter** networking so the VM gets its own LAN IP and the host browser can
reach it.

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

### Actual deployment transcript

Run inside the VM (`screenshots/vm-deploy.png`):

```
jeswin@ubuntu-vm:~$ docker --version
Docker version 29.8.0, build 88096ef

jeswin@ubuntu-vm:~$ docker pull jechuimmanuel/portfolio:v2
Digest: sha256:a9a6c16a7882772d346cbdbf0d076dd13fd2d3d7da9196ad5c8f05edf8f3df42
Status: Downloaded newer image for jechuimmanuel/portfolio:v2

jeswin@ubuntu-vm:~$ docker run -d --name portfolio --restart unless-stopped \
                      -p 3200:3000 jechuimmanuel/portfolio:v2
7a8782ef02a3e30fcecb94cea12ac036189f755f079aaadbd8155f73af08c9a5

jeswin@ubuntu-vm:~$ docker ps
CONTAINER ID   IMAGE                        STATUS        PORTS                     NAMES
7a8782ef02a3   jechuimmanuel/portfolio:v2   Up 9 seconds  0.0.0.0:3200->3000/tcp    portfolio

jeswin@ubuntu-vm:~$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3200
200

jeswin@ubuntu-vm:~$ curl -s http://localhost:3200 | grep -o "v2 · Dockerized"
v2 · Dockerized

jeswin@ubuntu-vm:~$ hostname -I
172.18.129.67 172.17.0.1
```

**Why port 3200 and not 3000.** WSL 2 uses mirrored networking, so the VM shares the
host's port space. Host port 3000 was already bound by the container from §6, and binding
it again inside the VM failed with `address already in use`. Publishing on **3200** avoids
the clash — and it also makes the verification unambiguous: the Windows engine has no
container on 3200, so a response there can only come from the VM's engine.

```
Windows host:  curl http://localhost:3200  -> 200   (served by the VM)
Windows host:  docker ps                          -> only portfolio-v2 on 3000
```

On a VirtualBox or VMware guest this collision does not arise, because the guest has its
own IP; use `-p 3000:3000` and browse to `http://<VM-IP>:3000`.

### Accessing the VM by its IP address — limitation on WSL 2

> This limitation applies to the WSL 2 target only. It is **not** a limitation of the
> deployment: on the AWS instance in §11.A the same image is reached by public IP with no
> firewall change at all. It is recorded here for completeness.

The lab asks for access via *the VM's IP address and port*. On this WSL 2 setup that
works **inside** the VM but is blocked **from the Windows host**:

```
inside the VM  -> http://172.18.129.67:3200   200   (container binds 0.0.0.0:3200)
Windows host   -> http://172.18.129.67:3200   failed to connect
Windows host   -> http://localhost:3200       200
```

The container is listening correctly on all interfaces — `ss -ltn` inside the VM shows
`docker-proxy` on `0.0.0.0:3200`, and ICMP to `172.18.129.67` succeeds from Windows. What
blocks it is the **Hyper-V firewall** that Windows 11 places on the WSL virtual switch
(`vEthernet (WSL (Hyper-V firewall))`, gateway `172.18.128.1`), which denies inbound TCP
to the VM by default. The supported route from Windows is WSL 2's localhost forwarding,
`http://localhost:3200`, which is what the browser screenshot uses.

To allow IP-based access instead, add a Hyper-V firewall rule from an **elevated**
PowerShell (this changes a Windows security setting, so run it deliberately):

```powershell
New-NetFirewallHyperVRule -Name "WSL-portfolio-3200" `
  -DisplayName "WSL portfolio 3200" -Direction Inbound `
  -VMCreatorId "{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}" `
  -Protocol TCP -LocalPorts 3200 -Action Allow
```

On a VirtualBox or VMware guest with a **Bridged Adapter** this restriction does not
apply: the guest holds its own LAN IP and `http://<VM-IP>:3000` is reachable from the host
browser with no firewall change. That is the topology the lab assumes.

The app served by the VM is captured in `screenshots/browser-vm.png` — the
`v2 · Dockerized` badge confirms the modified version was the one deployed.

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
| `screenshots/dockerhub.png` | *Not included.* The push is evidenced instead by `logs/dockerhub-push.log` and the digests in §8 — see the note below. |
| `screenshots/aws-deploy.png` | The **AWS EC2** instance pulling `jechuimmanuel/portfolio:v2` from Docker Hub and running it. |
| `screenshots/browser-aws.png` | The application served **from AWS, reached over the internet at `http://56.228.18.13:3000`**, showing the `v2 · Dockerized` badge. |
| `screenshots/vm-deploy.png` | The local WSL 2 VM pulling `jechuimmanuel/portfolio:v2` from Docker Hub and running it. |
| `screenshots/browser-vm.png` | The application served **by the local VM**, showing the `v2 · Dockerized` badge. |

Raw command output is also preserved as text in `logs/` for reference.

> **Note on `dockerhub.png`.** A capture of the Docker Hub web page is not included. The
> push itself is complete and independently verifiable three ways: the push transcript in
> `logs/dockerhub-push.log`, the per-tag registry digests recorded in §8, and a round-trip
> test in which the local image was deleted and re-pulled from the registry. Anyone can
> confirm the images are public by running:
>
> ```bash
> docker pull jechuimmanuel/portfolio:v2
> ```
>
> The `browser-vm.png` screenshot is itself downstream proof: the VM had no source code and
> an empty Docker engine, so the application it serves could only have come from the
> registry.

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
| Q3 | Image pushed to Docker Hub | Done — `v1`, `v2` and `latest` live; verified by re-pull (§8) |
| Q3 | Pulled & run on VM | Done — **AWS EC2 `t3.micro`** (§11.A) and local WSL 2 VM (§11.B) |
| Q3 | Accessed by the VM's IP + port | Done — `http://56.228.18.13:3000` → 200 over the internet (`screenshots/browser-aws.png`) |
| Q3 | v2 confirmed on the VM | Done — badge present in the AWS-served HTML; pulled digest matches the pushed image |
| — | `screenshots/dockerhub.png` | Not included — push evidenced by `logs/dockerhub-push.log`, §8 digests and a re-pull test (§13) |
| — | Badge reverted on `main` (post-capture) | Done — commit `26ce4b2`; see the note below |

### Note on the repository after the lab

The `v2 · Dockerized` badge is a lab marker rather than a feature of the live portfolio,
so it was removed from the `main` branch **after** the `v2` image was built and all
screenshots were captured. Nothing in this report is affected by that:

| Artefact | Contains the badge? | Why |
|---|---|---|
| `v2` image `a9a6c16a7882` | Yes | A built image is immutable — later edits to the source cannot change it. |
| `source-code/` in this submission | Yes | This is the exact code the `v2` image was built from. |
| `screenshots/browser-v2.png` | Yes | Captured from the running `v2` container. |
| `components/Navbar.tsx` on `main` | No | Reverted so the badge does not appear on the deployed site. |

**Consequence for rebuilding:** running `docker build` against the current `main` branch
would produce an image *without* the badge. To reproduce an image identical to `v2`, either
build from the `source-code/` directory in this submission, or re-apply the JSX snippet in
§10 to `components/Navbar.tsx` first.

Git history for the lab:

```
26ce4b2  revert(ui): drop the v2 Dockerized badge from the navbar
b2d8946  feat(docker): containerize portfolio and add v2 release badge
```

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
pointing at the same image ID, and `docker push` uploads the layers to the registry. On each
target VM, `docker pull` fetches exactly those layers and `docker run` starts the identical
application — no source code, no Node.js installation and no build step on the target machine.

This was proven twice on machines that had never seen the project: an **AWS EC2 `t3.micro`**
running Ubuntu 26.04 in a data centre, and a **local WSL 2 VM**. Both started with an empty
Docker engine, and both ended up serving the identical application — the digest pulled on
each (`a9a6c16a7882`) matches the digest pushed from the laptop, byte for byte. On AWS the
result is reachable from any browser at `http://56.228.18.13:3000`.

That is the central benefit this lab demonstrates: the image is built once, and the same
artefact runs unchanged on a Windows laptop, a local Linux VM and a cloud server, because
everything it depends on travels inside it.
