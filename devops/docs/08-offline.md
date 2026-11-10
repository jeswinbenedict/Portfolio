# Running Everything Offline

What works with no internet, what does not, and how to prepare so the exam
demo is not at the mercy of the room's wifi.

---

## 1. The rule

**Downloading needs internet. Running does not.**

Container images, Terraform providers, Kubernetes images and Ansible
collections are all cached on disk after the first fetch. Once cached,
everything below runs disconnected.

---

## 2. Prepare while you still have internet

Run this **the day before**. It is the single most useful thing in this doc.

```powershell
# 1. Application image
docker pull jechuimmanuel/portfolio:v3

# 2. Monitoring stack images
cd devops\monitoring
docker compose pull

# 3. ELK stack images
cd ..\elk
docker compose pull

# 4. Kubernetes cluster (downloads ~1 GB once, then cached forever)
minikube start --driver=docker --memory=3000 --cpus=2
minikube image load jechuimmanuel/portfolio:v3   # push the app INTO the cluster
minikube stop

# 5. Terraform providers
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/terraform
terraform init      # caches the AWS provider into .terraform/
```

Verify everything is local:

```powershell
docker images
```

You should see `jechuimmanuel/portfolio`, `prom/prometheus`, `grafana/grafana`,
`grafana/loki`, `grafana/promtail`, `gcr.io/cadvisor/cadvisor`,
`prom/node-exporter`, the three `docker.elastic.co/*` images, and
`gcr.io/k8s-minikube/kicbase`.

---

## 3. What works offline

| Component | Offline? | Notes |
|---|---|---|
| **Docker run** | ✅ Fully | Once the image is pulled |
| **Docker build** | ⚠ Partly | `npm ci` needs the registry unless `node_modules` is cached |
| **Ansible (local)** | ✅ Fully | `--limit local` against your own machine |
| **Ansible (remote)** | ❌ | Needs the network to reach the server |
| **Kubernetes/Minikube** | ✅ Fully | After `minikube image load`; `imagePullPolicy: IfNotPresent` is what makes this work |
| **Monitoring stack** | ✅ Fully | Grafana's update check is disabled in the compose file |
| **ELK stack** | ✅ Fully | All three images cached |
| **nginx** | ✅ Fully | With `portfolio.local` in the hosts file |
| **Terraform `validate` / `plan`*** | ✅ / ⚠ | `validate` is offline. `plan` contacts AWS |
| **Terraform `apply`** | ❌ | Creates real cloud resources |
| **Docker Hub push/pull** | ❌ | It is a remote registry |
| **Let's Encrypt** | ❌ | The CA must reach your server — use a self-signed cert instead |

---

## 4. The offline demo script

If the exam room has no internet, this sequence still demonstrates
containerisation, configuration management, orchestration and observability.

```powershell
# --- Docker ---
docker run -d --name portfolio -p 3000:3000 jechuimmanuel/portfolio:v3
docker ps
# browse http://localhost:3000

# host independence
node -v
docker run --rm jechuimmanuel/portfolio:v3 node -v
```

```bash
# --- Ansible (idempotency — run twice) ---
wsl -d Ubuntu
cd /mnt/c/Users/jeswi/OneDrive/Desktop/portfolio/devops/ansible
export ANSIBLE_CONFIG=$PWD/ansible.cfg
ansible-playbook playbook.yml --limit local    # changed=1
ansible-playbook playbook.yml --limit local    # changed=0  ← the point
```

```powershell
# --- Kubernetes (self-healing) ---
minikube start --driver=docker --memory=3000 --cpus=2
kubectl apply -f devops\kubernetes\
kubectl get pods
kubectl delete pod <one-pod-name>
kubectl get pods        # a replacement is already being created
```

```powershell
# --- Monitoring ---
cd devops\monitoring
docker compose up -d
# Grafana http://localhost:3001  (admin/admin)
```

```powershell
# --- Terraform (explain, do not apply) ---
wsl -d Ubuntu
cd /mnt/c/.../devops/terraform
terraform validate      # works offline
# then walk through main.tf and explain the resources
```

Only the Docker Hub push and `terraform apply` are unavailable — and you can
explain both from the lab report, which has the recorded transcripts.

---

## 5. Making `docker build` work offline

The build runs `npm ci`, which normally contacts the npm registry. To build
with no internet, prime the npm cache first (while online):

```powershell
npm ci              # populates %AppData%\npm-cache
```

Then build using the host cache:

```powershell
docker build --network=none -t portfolio:offline .
```

Simpler for exam purposes: **do not rebuild.** The image is already built and
cached; `docker run` it. Rebuilding proves nothing extra and risks failing live.

---

## 6. Offline Kubernetes — the key detail

Minikube runs its own container runtime, separate from Docker Desktop. An image
in `docker images` is **not** automatically visible to the cluster. You must
load it in:

```powershell
minikube image load jechuimmanuel/portfolio:v3
minikube image ls | findstr portfolio
```

This matters because `deployment.yaml` sets:

```yaml
imagePullPolicy: IfNotPresent
```

`IfNotPresent` uses the local copy when it exists. The default, `Always`, would
contact Docker Hub on every Pod start and fail offline. If your Pods sit in
`ErrImagePull` or `ImagePullBackOff` with no internet, this is why.

---

## 7. Quick offline checklist

- [ ] `docker images` shows all required images
- [ ] `minikube image ls | findstr portfolio` shows the app image
- [ ] `terraform init` has been run (`.terraform/` exists)
- [ ] `ansible-galaxy collection list | grep docker` shows `community.docker`
- [ ] `portfolio.local` is in the Windows hosts file (if demoing nginx)
- [ ] Docker Desktop starts cleanly — `docker ps` works
