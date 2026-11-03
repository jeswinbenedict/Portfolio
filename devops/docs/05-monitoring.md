# Monitoring — Prometheus, Grafana and Loki

---

## 1. The three pillars

| Pillar | Question it answers | Tool here |
|---|---|---|
| **Metrics** | *How much? How fast?* Numbers over time | Prometheus |
| **Logs** | *What exactly happened?* Discrete events | Loki |
| **Traces** | *Where did this request spend its time?* | (not covered) |

Metrics tell you something is wrong. Logs tell you what.

---

## 2. The stack

```
  portfolio ──logs──► promtail ──► loki ──┐
                                           ├──► GRAFANA
  cadvisor ────┐                           │
  node-exporter├──scraped by──► prometheus ┘
  prometheus ──┘
```

| Service | Port | Role |
|---|---|---|
| portfolio | 3000 | the app being observed |
| cadvisor | 8080 | per-container CPU, memory, network |
| node-exporter | 9100 | host metrics |
| prometheus | 9090 | scrapes and stores metrics |
| loki | 3100 | stores logs |
| promtail | — | ships container logs to Loki |
| grafana | **3001** | dashboards (3000 is taken by the app) |

```bash
cd devops/monitoring
docker compose up -d
```

Grafana at **http://localhost:3001**, `admin` / `admin`.

---

## 3. Prometheus pulls — it is not pushed to

This is the defining design choice. Prometheus periodically fetches a
plain-text `/metrics` page from each target.

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "cadvisor"
    static_configs:
      - targets: ["cadvisor:8080"]
```

**Why pull is useful:** you can open a target's `/metrics` in a browser and
see exactly what Prometheus sees; a target that stops responding is
*detectable* (`up == 0`), whereas something that stops pushing is
indistinguishable from something with nothing to say.

`cadvisor:8080` is a **Docker DNS name**, resolvable because both containers
share the `observability` network — not a hostname on your laptop.

---

## 4. ⚠ The `portfolio` target shows DOWN — on purpose

Check **Status → Targets** in Prometheus and the `portfolio` job is red.

**This is expected and you should say so.** A stock Next.js app does not
expose a `/metrics` endpoint. Prometheus is reporting the truth: it cannot
scrape what does not exist.

Container CPU and memory for the app still arrive — via cAdvisor, which reads
Docker's stats API. That is what the dashboard actually charts.

To make it green you would add a `/metrics` route using `prom-client`.
Knowing why it is red scores better than hiding it.

---

## 5. Metric types

| Type | Behaviour | Example |
|---|---|---|
| **Counter** | Only goes up (resets on restart) | `container_cpu_usage_seconds_total` |
| **Gauge** | Goes up and down | `container_memory_usage_bytes` |
| **Histogram** | Buckets of observations | request duration |
| **Summary** | Client-side quantiles | — |

**You almost never graph a counter directly** — it is a meaningless
ever-rising line. Wrap it in `rate()`.

---

## 6. PromQL, enough to explain the dashboard

```promql
container_memory_usage_bytes{name="portfolio"}
```
A gauge, filtered by label. `{}` is the label selector.

```promql
rate(container_cpu_usage_seconds_total{name!=""}[2m]) * 100
```
`rate()` converts the CPU-seconds counter into per-second change, averaged
over a 2-minute window. ×100 gives percent of one core. `name!=""` drops
aggregate cgroup series that have no container name.

```promql
sum(up)
```
`up` is synthetic — 1 if the last scrape succeeded, 0 if not.

```promql
sum by (name) (rate(container_network_receive_bytes_total[2m]))
```
`sum by (name)` aggregates and keeps only that label.

**Rule of thumb:** counters get `rate()`, gauges are graphed raw.

---

## 7. Grafana provisioning

Datasources and dashboards are defined as **files**, not clicked in the UI:

```
grafana/provisioning/
├── datasources/datasources.yml
└── dashboards/
    ├── dashboards.yml
    └── portfolio-dashboard.json
```

Two reasons: the demo is repeatable (a fresh `compose up` is already
configured), and the config lives in Git where it can be reviewed.

The datasource URL is `http://prometheus:9090` — the Docker DNS name and the
*internal* port, because Grafana reaches it over the compose network, not via
a published host port.

---

## 8. Loki — logs, cheaply

Loki is "Prometheus, for logs". The key design decision:

> **Loki indexes only labels, never the log text.**

Elasticsearch builds a full-text inverted index on write — powerful, but it is
why it needs gigabytes of RAM. Loki stores compressed chunks keyed by labels
and scans them at query time. Result: roughly a third of the memory for the
same job.

LogQL looks deliberately like PromQL:

```logql
{container="portfolio"}                    # stream selector
{container="portfolio"} |= "error"         # lines containing "error"
{container="portfolio"} != "GET /health"   # excluding
rate({container="portfolio"} |= "error" [5m])   # error rate as a metric
```

The `{}` selector is required and uses indexed labels. The filters after `|`
scan — which is why you narrow with labels first.

Promtail discovers containers through the Docker socket and relabels Docker's
metadata into the labels you query by.

---

## 9. The dashboard

`Portfolio → Container Health`:

| Panel | Shows |
|---|---|
| Containers running | `count(container_last_seen{name!=""})` — drops if one dies |
| Portfolio memory | current RSS, thresholds at 400/500 MB |
| Host memory available | headroom on the laptop |
| Prometheus targets up | `sum(up)` |
| CPU by container | `rate(...)` — stacked |
| Memory by container | gauges |
| Network traffic | receive/transmit rates |
| **Portfolio logs** | Loki panel, `{container="portfolio"}` |

Metrics and logs on one screen, which is the practical argument for Grafana.

---

## 10. A useful demo

```bash
# generate load
for i in $(seq 1 200); do curl -s -o /dev/null http://localhost:3000; done
```

Watch the CPU and network panels react within ~15 s (one scrape interval),
then settle. That visibly connects "traffic arrived" to "the graph moved".

---

## 11. Alerting (concept)

Not configured here, but worth being able to describe. Prometheus evaluates
rules and fires to Alertmanager, which deduplicates and routes to email/Slack:

```yaml
- alert: PortfolioDown
  expr: up{job="portfolio"} == 0
  for: 2m          # must stay true for 2 minutes — avoids flapping
  annotations:
    summary: "Portfolio has been unreachable for 2 minutes"
```

`for:` is the important field — it separates a real outage from a single
failed scrape.

---

## 12. Common failures

| Symptom | Cause |
|---|---|
| Grafana "no data" | Check Prometheus → Targets first; the datasource may be fine and the target down |
| Target DOWN | Wrong port, or the service exposes no `/metrics` (see §4) |
| Loki panel empty | Promtail cannot read `/var/lib/docker/containers` — check the mount |
| cAdvisor won't start | Needs its read-only host mounts; on Docker Desktop some are limited |
| Grafana asks to change password | It is `admin`/`admin`; skip or set one |
