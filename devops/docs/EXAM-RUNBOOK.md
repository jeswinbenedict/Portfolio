# Lab FAT — Demo Runbook

Read this the night before, and keep it open during the exam.
Everything here has been run on this machine and works.

---

## 0. Pre-flight — do this 20 minutes before

**Memory first.** The full demo (ELK + Grafana) uses ~4 GB inside Docker.
Close Opera and Brave, and stop other Docker projects — your **LuzHire**
Supabase stack auto-starts and takes ~1.8 GB:

```powershell
docker stop $(docker ps --filter name=_LuzHire -q)
```

Restart it afterwards with `supabase start` in the LuzHire folder.

**Run ELK and Grafana together** (verified working): start ELK first, then the
monitoring stack *without* its own app container, so the two do not fight over
the `portfolio` name and port 3000:

```powershell
cd devops\elk;        docker compose up -d
cd ..\monitoring;     docker compose up -d --no-deps cadvisor node-exporter prometheus loki promtail grafana
```

The Grafana dashboard matches containers by image, so it monitors the ELK
stack's copy of the app. Minikube (~3 GB) will not fit alongside both — run it
on its own.

Docker Desktop is the single most likely thing to fail. Start it **early**.

```powershell
docker ps
```

If that errors with a **stale socket** message, run the fix in
[`../README.md` §6b](../README.md) and wait ~60 s. This has happened twice;
do not discover it in front of your examiner.

Then confirm the image is present:

```powershell
docker images jechuimmanuel/portfolio
```

Expected: `v1`, `v2` and `latest`, each 265 MB.

If you have internet, pre-pull so nothing downloads mid-demo:

```powershell
docker pull jechuimmanuel/portfolio:v3
```

---

## 1. Docker — 3 minutes

**Say:** *"The portfolio is a Next.js app. Normally it needs Node, a dependency
tree and a build step. I packaged all three into an image so it runs anywhere."*

```powershell
docker images jechuimmanuel/portfolio
docker run -d --name portfolio -p 3000:3000 --env-file .env.local jechuimmanuel/portfolio:v3
docker ps
```

Open **http://localhost:3000**, then **/login** — the OAuth page is what
identifies the v3 build.

**Say about `--env-file`:** *"The OAuth secrets are injected at runtime, not
baked into the image. Anyone who pulls my public image gets no credentials —
run it without `--env-file` and the login page just reports it is not
configured."*

**Prove it is independent of the host:**

```powershell
node -v
docker run --rm jechuimmanuel/portfolio:v3 node -v
```

**Say:** *"The host runs Node 25 on Windows. The container runs its own Node 20
on Alpine Linux, as a non-root user. Nothing on my laptop is used at runtime."*

### Explaining the Dockerfile

Three stages — **deps**, **builder**, **runner**. Only the third ships.

| Line | Why |
|---|---|
| `COPY package*.json ./` before source | Layer caching — deps reinstall only when they change |
| `npm ci` not `npm install` | Installs exact lockfile versions; reproducible |
| `output: "standalone"` | Next traces only imported modules → 265 MB not ~1 GB |
| `ENV HOSTNAME=0.0.0.0` | Default localhost bind would make `-p` publish an unreachable port |
| `COPY .next/static` separately | Not part of standalone output — omit it and the page is unstyled |
| `USER nextjs` | Drops root; a compromised process is not root |
| `CMD ["node","server.js"]` exec form | Node is PID 1 and receives SIGTERM for clean shutdown |

---

## 2. Docker Hub — 1 minute

```powershell
docker push jechuimmanuel/portfolio:v3
```

(Already pushed — show the repo page instead: `hub.docker.com/r/jechuimmanuel/portfolio`)

**Say:** *"Tagging adds a name pointing at the same image ID; it copies nothing.
Pushing uploads the layers. The registry shows 60 MB compressed versus 265 MB
on disk — same image, compressed in transit."*

---

## 3. Terraform — 4 minutes

```bash
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/terraform
terraform init
terraform validate
terraform plan
```

**Say:** *"Terraform is declarative. I describe the desired infrastructure; it
diffs that against reality and shows a plan before changing anything."*

`plan` output reads: **`+` create, `~` modify, `-` destroy.**

To actually build it (needs `aws configure` first):

```bash
terraform apply       # type: yes
terraform output app_url
```

**⚠ Always finish with:**

```bash
terraform destroy     # type: yes
```

### Likely questions

- **"What is state?"** — `terraform.tfstate` maps your `.tf` files to real AWS
  resource IDs. Without it Terraform cannot know that `aws_instance.portfolio`
  is `i-0abc123`. It is gitignored because it can contain secrets; teams keep
  it in S3 with locking.
- **"Why not just click in the console?"** — Not reproducible, not reviewable,
  not version-controlled, and nobody can tell later what was configured.
- **"Terraform vs Ansible?"** — Terraform *creates* infrastructure, Ansible
  *configures* what runs on it. Provisioning vs configuration management.

---

## 4. Ansible — 4 minutes

**This works offline.** Great fallback if the exam room has no internet.

```bash
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/ansible
export ANSIBLE_CONFIG=$PWD/ansible.cfg
ansible-playbook playbook.yml --limit local
```

**Then run it a second time** — this is the moment that scores marks:

```bash
ansible-playbook playbook.yml --limit local
```

First run: `changed=1`. Second run: **`changed=0`**.

**Say:** *"That is idempotency. Ansible compares desired state against actual
state and only acts on the difference. A shell script doing `docker run` twice
would error; this reports 'ok' and does nothing."*

Note the `skipped=7` — the Docker-install tasks skip because Docker is already
present. That `when:` condition is the idempotency in action.

### Likely questions

- **"What is an inventory?"** — The list of managed hosts and how to reach them.
  `[local]` uses `ansible_connection=local`; `[webservers]` uses SSH.
- **"What is a role?"** — A reusable bundle of tasks, so the same logic can be
  applied to another host or project without copy-paste.
- **"Agentless?"** — Yes. Ansible needs only SSH and Python on the target.
  Nothing is installed on managed machines.

---

## 5. Kubernetes / Minikube — 5 minutes

```powershell
minikube start --driver=docker --memory=3000 --cpus=2
kubectl apply -f devops/kubernetes/
kubectl get pods
kubectl get svc
minikube service portfolio-service --url
```

### The self-healing demo — do this one

```powershell
kubectl get pods
kubectl delete pod <paste-one-pod-name>
kubectl get pods        # run immediately
```

**Say:** *"I declared `replicas: 2`. Kubernetes runs a control loop comparing
desired state to actual state. I deleted a Pod; it is already creating a
replacement. Docker would have left it down."*

### Scaling

```powershell
kubectl scale deployment portfolio --replicas=4
kubectl get pods
```

### Likely questions

- **"Pod vs container?"** — A Pod wraps one or more containers that share a
  network namespace and storage. It is the smallest schedulable unit.
- **"Why a Service?"** — Pod IPs change on every restart. A Service is a stable
  virtual IP and DNS name that load-balances across ready Pods.
- **"readiness vs liveness?"** — Readiness: may this Pod receive traffic?
  Failing it removes the Pod from the Service. Liveness: is it wedged? Failing
  it kills and restarts the container.
- **"NodePort?"** — Opens a port (30000–32767) on the node so you can reach the
  Service from outside the cluster.

---

## 6. Monitoring — 4 minutes

```powershell
cd devops\monitoring
docker compose up -d
```

- Grafana **http://localhost:3001** — admin / admin → *Portfolio → Container Health*
- Prometheus **http://localhost:9090** → Status → Targets

**Say:** *"Prometheus uses a pull model — it scrapes a `/metrics` endpoint every
15 seconds. cAdvisor exposes per-container CPU and memory; node-exporter does
the host. Grafana queries Prometheus with PromQL and draws it."*

**Be ready for this:** the `portfolio` target shows **DOWN** — on purpose. A
stock Next.js app has no `/metrics` endpoint. *"Prometheus is reporting the
truth: it cannot scrape what does not exist. Container CPU and memory still
arrive via cAdvisor, which is what the dashboard charts. To make it UP I would
add a `/metrics` route with `prom-client`."* Knowing that scores better than
hiding it.

**Logs:** the bottom panel queries Loki with `{container="portfolio"}`.
*"Loki indexes only labels, not message text — that is why it needs a third of
Elasticsearch's memory."*

Shut it down before the next stack:

```powershell
docker compose down
```

---

## 7. ELK — 4 minutes

> Run **after** `docker compose down` on monitoring and `minikube stop`.
> ELK needs ~3–4 GB.

```powershell
cd devops\elk
docker compose up -d
docker compose ps
```

Wait ~90 s, then **http://localhost:5601** →
*Discover* → create data view `portfolio-logs-*`.

**Say:** *"The pipeline is Filebeat → Logstash → Elasticsearch → Kibana.
Filebeat tails container logs. Logstash parses them — my config derives a
`log_level` field with regex and tags portfolio events. Elasticsearch indexes
them. Kibana searches."*

**Say about indices:** *"One index per day, `portfolio-logs-2026.11.03`.
Retention becomes dropping whole indices rather than per-document deletes."*

Cluster health will be **yellow** — correct for single-node: replica shards have
nowhere to go. Not an error.

```powershell
docker compose down
```

---

## 8. OAuth login — 3 minutes

Best shown **from the container**, since that is the deployed artifact:

```powershell
docker run -d --name portfolio -p 3000:3000 --env-file .env.local jechuimmanuel/portfolio:v3
```

Or locally with `npm run dev` — **not** `npm start`, which does not work with
`output: "standalone"`.

Browse to **http://localhost:3000/login** → **Sign in with GitHub** →
Authorize → you land on `/dashboard` with your avatar, handle and session
expiry. Then **Sign out**, and try `/dashboard` again — it bounces to login.

**Say:** *"Without OAuth, 'sign in with GitHub' would mean asking for their
GitHub password — a credential that works everywhere on GitHub. OAuth is
delegated authorisation: the user authenticates on GitHub's own page, and my
app receives a short-lived token for only the permission they approved. The
password never touches my application."*

### Walk the flow

```
 /login → /api/auth/github → github.com/authorize → callback
        → verify state → swap code for token (server-side)
        → read profile → mint our session → /dashboard
```

**The three security points to make:**

| Mechanism | Attack it stops |
|---|---|
| `state` random value echoed back | CSRF / session fixation — someone handing you *their* code |
| `httpOnly` cookie | XSS — page JavaScript cannot read the session |
| GitHub's token discarded after use | Holding a live credential that can act on their GitHub |

Also: `scope=read:user` is the narrowest scope that returns a profile. Request
the least you need.

### The demo that lands best

Show the CSRF guard rejecting a forged callback:

```powershell
curl.exe -i "http://localhost:3000/api/auth/callback/github?code=fake&state=attacker"
```

```
307 → /login?error=state_mismatch
```

**Say:** *"I supplied an attacker-controlled state with no matching cookie. It
was rejected before any token exchange happened."*

### Likely questions

- **"Why two layers of protection?"** — `proxy.ts` does an optimistic cookie
  check and redirects early; the dashboard page checks again. Proxy runs on
  prefetched routes too, so it must stay cheap and must not be the only guard.
  The authoritative check belongs next to the data.
- **"Why not NextAuth?"** — Built by hand so every step of the exchange is
  visible and explainable. A library would hide exactly what is being examined.
- **"Where is the session stored?"** — A jose-signed JWT (HS256) in an
  httpOnly, SameSite=lax cookie. Stateless: no database needed.

### ⚠ Be ready for this one

**OAuth cannot work on GitHub Pages.** Pages serves static files and cannot
execute route handlers, so on `jeswinbenedict.github.io` the login page renders
but the button leads nowhere. That is the inherent difference between static
hosting and a server runtime — not a bug. Demo OAuth from local or Docker.

---

## 9. Cloudflare — live, zero cost

```powershell
C:\Users\jeswi\bin\cloudflared.exe tunnel --no-autoupdate --url http://localhost:3000
```

Open the printed `https://….trycloudflare.com` URL. A **phone on mobile data**
is the most convincing proof, since that is clearly not your laptop's network.

**Say:** *"cloudflared makes an outbound connection to Cloudflare. Visitors hit
Cloudflare's edge, which relays traffic back down that tunnel. No inbound port
is open, my IP is never exposed, and TLS is handled at the edge, so it is HTTPS
with no certificate setup."*

**Be upfront:** `trycloudflare.com` is Cloudflare's domain. A custom name needs
a purchased domain; the full procedure is in `07-domain-and-https.md` §4b.
Ctrl+C closes the tunnel — it is public while it runs.

---

## 9b. Custom domain — explain, do not live-demo

You do not own a domain yet, so **explain the design** and show the config:

```powershell
type devops\nginx\portfolio.conf
```

**Say:** *"nginx sits in front as a reverse proxy. The container listens on
3000 bound to loopback; nginx owns 80 and 443. That gives me TLS termination,
security headers and caching without touching the app. I set
`X-Forwarded-For` and `X-Forwarded-Proto` so the app sees the real client IP
and scheme instead of nginx's own. Certbot then issues a Let's Encrypt
certificate and auto-renews every 60 days."*

Full procedure: [`07-domain-and-https.md`](07-domain-and-https.md).

---

## 10. If something breaks

| Symptom | Fix |
|---|---|
| `docker ps` errors, stale socket | README §6b — move socket dirs aside, restart |
| Port 3000 already in use | `docker rm -f portfolio` then re-run |
| Ansible ignores `ansible.cfg` | `export ANSIBLE_CONFIG=$PWD/ansible.cfg` |
| Minikube won't start | `minikube delete` then `minikube start` |
| ELK containers exit / OOM | Stop the other stacks first |
| Kibana "server not ready" | Wait 90 s — Elasticsearch starts first |
| No internet | Use the Ansible local demo and pre-pulled images — see `08-offline.md` |

---

## 11. One-paragraph summary

> *"I containerised my Next.js portfolio with a three-stage Docker build that
> ships a 265 MB image containing only compiled output. I published it to Docker
> Hub, then provisioned an AWS EC2 instance with Terraform and configured it
> with an idempotent Ansible playbook — the server pulls the image from the
> registry, so no source code or build step is needed on it. I also run it on
> Kubernetes via Minikube with two replicas and health probes to demonstrate
> self-healing. For observability, Prometheus scrapes container metrics and
> Grafana visualises them, with Loki for logs, and I have a full ELK pipeline
> for log parsing and search. nginx fronts it as a reverse proxy for a custom
> domain with Let's Encrypt TLS, and the site has GitHub OAuth login with the
> session held as a signed JWT in an httpOnly cookie."*
