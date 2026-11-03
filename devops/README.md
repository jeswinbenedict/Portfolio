# DevOps Stack — Portfolio Project

Everything in this folder exists to take **one application** (the Next.js portfolio)
and run it through a complete modern deployment pipeline: containerised, published,
provisioned with code, configured automatically, orchestrated, monitored and logged.

This README is the map. Each section says **what** the tool is, **why** it exists,
and **how** to run it. Component details live in each subfolder.

---

## 1. The big picture

```
                      YOUR LAPTOP
   ┌──────────────────────────────────────────────┐
   │  source code  ──►  docker build  ──►  image  │
   └───────────────────────────────┬──────────────┘
                                   │ docker push
                                   ▼
                        ┌────────────────────┐
                        │    DOCKER HUB      │  jechuimmanuel/portfolio:v2
                        └─────────┬──────────┘
                     docker pull  │
            ┌──────────────────────┼──────────────────────┐
            ▼                      ▼                      ▼
     ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
     │  AWS EC2    │        │  MINIKUBE   │        │  LOCAL      │
     │  (cloud VM) │        │  (k8s)      │        │  docker run │
     └──────┬──────┘        └─────────────┘        └─────────────┘
            │
     created by TERRAFORM
     configured by ANSIBLE
     fronted by NGINX  ──►  custom domain + HTTPS

     observed by:  PROMETHEUS + GRAFANA (metrics)
                   LOKI / ELK            (logs)
```

The single idea tying it together: **build the image once, run that exact artifact
everywhere.** Nothing is rebuilt per environment.

---

## 2. What each tool is, and why it is here

| Tool | Category | What it does | Why we need it |
|---|---|---|---|
| **Docker** | Containerisation | Packages the app + Node runtime + dependencies into one image | "Works on my machine" stops being a problem — the runtime travels with the app |
| **Docker Hub** | Registry | Public storage for the image | How the image gets from your laptop to any server |
| **Terraform** | Provisioning (IaC) | Creates the AWS server, firewall and key pair from code | Clicking in the console is not reproducible or reviewable |
| **Ansible** | Configuration mgmt | Installs Docker and starts the container on a server | Idempotent and re-runnable, unlike a shell script |
| **Kubernetes / Minikube** | Orchestration | Keeps N replicas healthy, self-heals, rolling updates | `docker run` gives one container with no recovery |
| **nginx** | Reverse proxy | Serves on 80/443, forwards to the container | Real domains, TLS, security headers |
| **Prometheus** | Metrics | Scrapes and stores numeric time series | You cannot fix what you cannot measure |
| **Grafana** | Visualisation | Dashboards over Prometheus and Loki | Turns raw metrics into something readable |
| **Loki** | Logs (light) | Log aggregation, indexes labels only | Same job as ELK at ~⅓ the memory |
| **ELK** | Logs (full) | Elasticsearch + Logstash + Kibana | Full-text search and a real parsing pipeline |

---

## 3. Folder layout

```
devops/
├── terraform/     Infrastructure as Code — creates the AWS EC2 instance
├── ansible/       Configuration management — installs and runs the app
├── kubernetes/    Deployment, Service, Ingress manifests for Minikube
├── monitoring/    Prometheus + Grafana + Loki (lightweight observability)
├── elk/           Elasticsearch + Logstash + Kibana (heavy log pipeline)
├── nginx/         Reverse proxy config for the custom domain
└── docs/          Step-by-step guides, offline notes, exam runbook
```

---

## 4. Where each tool is installed

Two environments, each with a clear job:

| Environment | Holds | Why there |
|---|---|---|
| **WSL Ubuntu** | Terraform, Ansible, AWS CLI | Ansible has no Windows control node. These are Linux-native infra tools. |
| **Windows** | Docker Desktop, Minikube, kubectl | Docker Desktop runs here, and Minikube uses it as its driver. |

Enter WSL with:

```bash
wsl -d Ubuntu
```

Installed versions at time of writing: Terraform v1.17.1, Ansible core 2.16.3,
AWS CLI 2.39.3, Minikube v1.39.0, Docker Engine 29.7.2.

---

## 5. Quick start — one command per stack

> ⚠ **Memory:** your laptop has 13.7 GB. Run **one** of Minikube / monitoring / ELK
> at a time. See §7.

**The app alone**

```bash
docker run -d --name portfolio -p 3000:3000 jechuimmanuel/portfolio:v2
```

**Monitoring stack** (Grafana `localhost:3001`, admin/admin)

```bash
cd devops/monitoring && docker compose up -d
```

**ELK stack** (Kibana `localhost:5601`, allow ~90 s)

```bash
cd devops/elk && docker compose up -d
```

**Kubernetes**

```bash
minikube start --driver=docker --memory=3000 --cpus=2
kubectl apply -f devops/kubernetes/
minikube service portfolio-service --url
```

**Terraform** (needs AWS credentials)

```bash
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/terraform
terraform init && terraform plan
```

**Ansible** (works offline against your own machine)

```bash
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/ansible
export ANSIBLE_CONFIG=$PWD/ansible.cfg
ansible-playbook playbook.yml --limit local
```

---

## 6. Two gotchas that will bite you

**a) Ansible ignores `ansible.cfg` on `/mnt/c`**

Windows drives are world-writable to Linux, and Ansible refuses to load a config
file from a world-writable directory — a security measure against someone
dropping a malicious config in a shared folder. You will see:

```
[WARNING]: Ansible is being run in a world writable directory ... ignoring it
```

Fix: set the path explicitly, which overrides the check.

```bash
export ANSIBLE_CONFIG=$PWD/ansible.cfg
```

**b) Docker Desktop fails to start with a "stale socket" error**

A known Docker Desktop bug. It leaves orphaned Unix socket files that Windows
cannot delete, then crashes trying to rename them:

```
initializing Ingest server: ... rename .../sailor-ingest.sock ... .stale:
The file cannot be accessed by the system.
```

Fix — stop Docker fully, move the socket folders aside, restart:

```powershell
Get-Process "Docker Desktop","com.docker.backend" -EA SilentlyContinue | Stop-Process -Force
Start-Sleep 8
$ts = Get-Date -Format yyyyMMddHHmmss
foreach ($t in @("$env:LOCALAPPDATA\Docker\run","$env:LOCALAPPDATA\docker-secrets-engine")) {
  if (Test-Path $t) { Rename-Item $t ((Split-Path $t -Leaf) + "-stale-$ts") }
  New-Item -ItemType Directory -Path $t -Force | Out-Null
}
Start-Process "C:\Users\jeswi\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
```

This has happened twice on this machine. **Start Docker Desktop well before your
exam and confirm `docker ps` works.**

---

## 7. Memory budget

| Stack | Approx. RAM |
|---|---|
| Portfolio container alone | ~120 MB |
| Monitoring (Prometheus + Grafana + Loki + exporters) | ~1 GB |
| Minikube (2 CPU / 3 GB) | ~3 GB |
| **ELK** (Elasticsearch + Logstash + Kibana + Filebeat) | **~3–4 GB** |
| Docker Desktop baseline | ~2 GB |

Windows itself takes 4–5 GB, so ELK **plus** Minikube will swap and crawl. Before
switching stacks:

```bash
cd devops/monitoring && docker compose down
cd devops/elk && docker compose down
minikube stop
```

---

## 8. What still needs you

| Item | Why I cannot do it | What to do |
|---|---|---|
| **Custom domain** | Requires a purchase | Buy from GoDaddy / Namecheap (~₹700–900/yr). Config is ready in `nginx/` — see `docs/07-domain-and-https.md` |
| **AWS credentials** | I must not handle your keys | `aws configure` in WSL, then `terraform apply` |
| **Cloudflare / Jira accounts** | Account creation | Sign up, then I can wire up the config |

---

## 9. Guides

| Doc | Covers |
|---|---|
| `docs/01-docker.md` | Images, layers, the Dockerfile line by line |
| `docs/02-terraform.md` | IaC concepts, state, the full workflow |
| `docs/03-ansible.md` | Idempotency, inventories, roles |
| `docs/04-kubernetes.md` | Pods, Deployments, Services, self-healing |
| `docs/05-monitoring.md` | Prometheus pull model, PromQL, Grafana |
| `docs/06-elk.md` | The log pipeline, Logstash filters |
| `docs/07-domain-and-https.md` | Buying a domain (GoDaddy → Cloudflare), DNS, nginx, Let's Encrypt |
| `docs/08-offline.md` | Running every piece with no internet |
| `docs/09-oauth.md` | GitHub OAuth login, sessions, the Next.js 16 `proxy.ts` rename |
| `docs/EXAM-RUNBOOK.md` | **The demo script — read this before the exam** |
