# Kubernetes — Orchestration

---

## 1. What Docker alone cannot do

`docker run` gives you one container on one machine. If the process dies, it
stays dead unless a restart policy catches it. If the machine dies, the app
dies. Scaling means manually starting more containers and putting a load
balancer in front by hand.

Kubernetes is a **control loop**. You declare desired state — "two healthy
replicas" — and it continuously compares that against reality and acts to
close the gap. Nobody tells it to restart anything; it notices.

That difference is what to demonstrate.

---

## 2. The object hierarchy

```
Deployment      "I want 2 replicas of this image"
   └── ReplicaSet    keeps exactly 2 Pods alive
         └── Pod          wraps the container(s)
               └── Container   your app
```

| Object | What it is |
|---|---|
| **Pod** | Smallest schedulable unit. One or more containers sharing a network namespace and storage. Usually one container. |
| **ReplicaSet** | Keeps N Pods running. You rarely create one directly. |
| **Deployment** | Manages ReplicaSets; gives you rolling updates and rollback. |
| **Service** | Stable virtual IP + DNS name, load-balancing across ready Pods. |
| **Ingress** | HTTP router — hostname/path → Service. |
| **Node** | A machine in the cluster. Minikube has one. |

**Why a Service is mandatory:** Pod IPs change on every restart. In our
cluster the Pods sat at `10.244.0.5` and `10.244.0.6`; delete one and the
replacement gets a different address. Nothing could target a Pod directly.
The Service is a permanent address that tracks whichever Pods are currently
ready.

---

## 3. The Deployment

```yaml
spec:
  replicas: 2
  selector:
    matchLabels:
      app: portfolio          # MUST match the template labels below
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: portfolio
          image: jechuimmanuel/portfolio:v2
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
```

**Labels are the glue.** The Deployment finds its Pods, and the Service finds
its backends, by label selector. If `selector.matchLabels` and the template
labels disagree, the Deployment manages nothing and nothing works.

**`imagePullPolicy: IfNotPresent`** uses a locally cached image when present.
The default `Always` contacts Docker Hub on every Pod start and fails with no
internet. This one line is what makes the offline demo work.

### Resource requests and limits

```yaml
resources:
  requests: { memory: "128Mi", cpu: "100m" }
  limits:   { memory: "512Mi", cpu: "500m" }
```

- **requests** — what the scheduler reserves when deciding where a Pod fits.
- **limits** — the hard ceiling. Exceeding **memory** gets the container
  OOM-killed; exceeding **CPU** only throttles it.

`100m` is 100 millicores = 0.1 of one core.

### Health probes

```yaml
readinessProbe:   # may this Pod receive traffic?
  httpGet: { path: /, port: 3000 }
  initialDelaySeconds: 3
livenessProbe:    # is this Pod wedged?
  httpGet: { path: /, port: 3000 }
  initialDelaySeconds: 15
```

| Probe | Fails → |
|---|---|
| **readiness** | Pod removed from the Service's endpoints. Still running. |
| **liveness** | Container **killed and restarted**. |

Without probes Kubernetes only knows whether the process exists — it would
happily route traffic to an app still booting. `initialDelaySeconds` on
liveness must exceed realistic startup time, or you get a restart loop.

---

## 4. The Service

```yaml
spec:
  type: NodePort
  selector:
    app: portfolio
  ports:
    - port: 80          # the Service's own port, inside the cluster
      targetPort: 3000  # the port on the Pod
      nodePort: 30080   # port opened on the node (30000-32767)
```

Three ports, three meanings — a classic exam question.

| Type | Reach |
|---|---|
| `ClusterIP` | Inside the cluster only (default) |
| `NodePort` | Also a port on the node itself |
| `LoadBalancer` | Asks the cloud for a real external LB |

---

## 5. Verified results

```
$ kubectl get deployment
NAME        READY   UP-TO-DATE   AVAILABLE
portfolio   2/2     2            2

$ kubectl get endpoints portfolio-service
ENDPOINTS
10.244.0.5:3000,10.244.0.6:3000      ← both Pods registered

$ kubectl port-forward service/portfolio-service 8088:80
$ curl http://localhost:8088          → 200, "v2 · Dockerized"
```

Two endpoints means the Service is genuinely load-balancing across both Pods,
and both passed their readiness probe.

### The self-healing demo

```
$ kubectl delete pod portfolio-6f55f5f9dd-4mgmc
pod deleted

$ kubectl get pods          # 8 seconds later
portfolio-6f55f5f9dd-8k4w5   1/1   Running   8s    ← new Pod
portfolio-6f55f5f9dd-j9khm   1/1   Running   41s
```

**Say:** *"I declared two replicas. The ReplicaSet controller noticed one was
gone and created a replacement before I could finish typing the next command.
Docker would have left it down."*

---

## 6. Minikube

A single-node cluster on your laptop. With `--driver=docker` the whole node
runs as a Docker container.

```bash
minikube start --driver=docker --memory=3000 --cpus=2
minikube status
minikube ip
minikube dashboard          # web UI
minikube stop
minikube delete             # destroy it entirely
```

### ⚠ Loading images for offline use

Minikube has its **own** container runtime. An image in `docker images` is not
visible to the cluster:

```bash
minikube image load jechuimmanuel/portfolio:v2
minikube image ls | findstr portfolio
```

Skip this with no internet and Pods sit in `ErrImagePull` / `ImagePullBackOff`.

### Reaching the app

With the Docker driver the node IP (`192.168.49.2`) is inside Docker's network
and not routable from Windows. Two options:

```bash
minikube service portfolio-service --url    # opens a tunnel, prints a URL
kubectl port-forward service/portfolio-service 8088:80
```

`port-forward` is more predictable for a demo — it does not block the terminal
the same way.

---

## 7. Commands worth knowing

```bash
kubectl apply -f devops/kubernetes/     # declarative: create or update
kubectl get pods -o wide                # include IPs and nodes
kubectl describe pod <name>             # events — FIRST STOP when debugging
kubectl logs <pod>                      # app output (-f to follow)
kubectl exec -it <pod> -- sh            # shell inside
kubectl scale deployment portfolio --replicas=4
kubectl rollout status deployment/portfolio
kubectl rollout undo deployment/portfolio   # roll back
kubectl delete -f devops/kubernetes/
```

**`kubectl describe` before `kubectl logs`.** If a Pod never started there are
no logs; the reason is in the events at the bottom of `describe`.

---

## 8. Rolling updates

```yaml
strategy:
  rollingUpdate:
    maxUnavailable: 0   # never drop below the desired count
    maxSurge: 1         # allow one extra Pod during the roll
```

Change the image tag and `kubectl apply`: Kubernetes starts a new Pod, waits
for its readiness probe, then removes an old one, repeating until done. With
`maxUnavailable: 0` the site never goes fully offline. `kubectl rollout undo`
reverses it, because the old ReplicaSet is kept.

---

## 9. Common failures

| Pod status | Meaning |
|---|---|
| `ImagePullBackOff` | Image not found — run `minikube image load`, check the tag |
| `CrashLoopBackOff` | Container starts then exits — `kubectl logs` |
| `Pending` | Nothing can schedule it — usually requests exceed node capacity |
| `0/1 Running` | Running but readiness failing — check the probe path/port |
| Service returns nothing | Label selector mismatch — `kubectl get endpoints` (empty = no match) |
