# ELK — Elasticsearch, Logstash, Kibana

---

## 1. ⚠ Read this before starting it

ELK needs roughly **3–4 GB of RAM**. Your laptop has 13.7 GB with Windows
taking 4–5 GB and Docker Desktop ~2 GB.

**Shut down the other stacks first:**

```bash
cd devops/monitoring && docker compose down
minikube stop
```

Running ELK alongside Minikube will swap and crawl. For day-to-day work use
`devops/monitoring` (Loki) — start ELK when you specifically need to show ELK.

---

## 2. The pipeline

```
  portfolio  ──stdout──►  Docker JSON log files
                                 │
                            FILEBEAT        tails files, adds container metadata
                                 │
                            LOGSTASH        parses, enriches, classifies
                                 │
                         ELASTICSEARCH      indexes for search
                                 │
                             KIBANA         search and visualise
```

| Component | Port | Role |
|---|---|---|
| Elasticsearch | 9200 | storage + search engine |
| Logstash | 5044 | the transform stage |
| Kibana | 5601 | the UI |
| Filebeat | — | the shipper |

```bash
cd devops/elk
docker compose up -d
docker compose ps
```

Kibana needs **~90 seconds** on first start — Elasticsearch must be healthy
first. "Kibana server is not ready yet" during that window is normal.

---

## 3. Why four components

Beats were added because Logstash is a JVM process that is too heavy to run on
every machine you want logs from. Filebeat is a small Go binary: it tails and
forwards, nothing more. Logstash then runs centrally and does the expensive
parsing once.

That split — light agent, central processor — is the standard pattern.

---

## 4. Elasticsearch

A distributed document store with an **inverted index**: for every term it
keeps the list of documents containing it. That is what makes full-text search
fast, and also why it is memory-hungry.

| Term | Meaning |
|---|---|
| **Document** | One JSON object — here, one log line |
| **Index** | A collection of documents (like a table) |
| **Shard** | A piece of an index; how it scales horizontally |
| **Replica** | A copy of a shard, for redundancy |

### Settings in our compose file

```yaml
- discovery.type=single-node          # skip cluster formation checks
- xpack.security.enabled=false        # no TLS/auth — LAB ONLY
- "ES_JAVA_OPTS=-Xms1g -Xmx1g"        # pin the heap
- bootstrap.memory_lock=true          # don't swap the heap
mem_limit: 2g
```

**Pinning the heap matters.** Left alone, Elasticsearch sizes it from total
host RAM and takes several GB. Rule of thumb: heap ≤ 50% of the container
limit, and `Xms` equal to `Xmx` so it never resizes.

**Security disabled is acceptable here and nowhere else.** A production
cluster must keep authentication and TLS on — unsecured Elasticsearch
instances exposed to the internet are a well-known source of data breaches.

### ⚠ Yellow health is correct

```bash
curl http://localhost:9200/_cluster/health
```

Expect `"status": "yellow"`. On a single node, replica shards have nowhere to
go, so they stay unassigned. Green requires at least two nodes. **Yellow is
not an error here** — say so before being asked.

---

## 5. Logstash — the stage that justifies ELK

Every pipeline has three blocks:

```
input  { }   where events come FROM
filter { }   how each event is parsed and reshaped
output { }   where events go TO
```

The filter is the point: it turns unstructured **lines** into structured
**fields** you can search and aggregate.

### Our filters

```ruby
# Docker wraps each line in JSON — unwrap it
if [message] =~ /^\{.*\}$/ {
  json { source => "message" skip_on_invalid_json => true }
}

# Tag portfolio events
if [container][name] == "portfolio" {
  mutate { add_field => { "application" => "portfolio" } }
}

# Derive a severity level Next.js never emitted
if [message] =~ /(?i)\b(error|exception|failed|fatal)\b/ {
  mutate { add_field => { "log_level" => "ERROR" } }
} else if [message] =~ /(?i)\b(warn|warning|deprecated)\b/ {
  mutate { add_field => { "log_level" => "WARN" } }
} else {
  mutate { add_field => { "log_level" => "INFO" } }
}
```

That third block is the demonstration: the application produces no severity
field, and the pipeline **creates one**. Now `log_level: ERROR` is a filter in
Kibana rather than a text search.

`(?i)` is case-insensitive; `\b` are word boundaries so "errors" matches but
"terrorist" does not.

### grok

The classic Logstash filter, for lines with a fixed shape:

```ruby
grok {
  match => { "message" => "%{IP:client} %{WORD:method} %{URIPATH:path} %{NUMBER:status}" }
}
```

Named patterns extract fields positionally — how you parse nginx or Apache
access logs.

---

## 6. Daily indices

```ruby
output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "portfolio-logs-%{+YYYY.MM.dd}"
  }
}
```

One index per day: `portfolio-logs-2026.11.03`.

**Why:** retention becomes *deleting whole indices*, which is near-instant.
Deleting individual old documents from a live index is expensive, because
Elasticsearch only marks them deleted and must merge segments later.

---

## 7. Using Kibana

1. **http://localhost:5601**
2. Menu → **Stack Management → Data Views → Create data view**
3. Name `portfolio-logs-*`, index pattern `portfolio-logs-*`, time field
   `@timestamp`
4. Menu → **Discover**

The `*` wildcard spans every daily index.

### KQL

```
container.name : "portfolio"
log_level : "ERROR"
log_level : "ERROR" and container.name : "portfolio"
message : *timeout*
not log_level : "INFO"
```

Generate something to look at:

```bash
for i in $(seq 1 50); do curl -s -o /dev/null http://localhost:3000; done
```

---

## 8. ELK vs Loki — the comparison to be ready for

| | ELK | Loki |
|---|---|---|
| Indexes | Full text | **Labels only** |
| RAM | ~3–4 GB | ~300 MB |
| Search | Fast arbitrary full-text | Scans chunks at query time |
| Parsing | Logstash, very capable | Limited |
| Best for | Deep forensic search | Correlating logs with metrics |

**Both are in this project deliberately.** Loki for everyday use next to
Grafana; ELK when you need real full-text search and a parsing pipeline.

Neither is "better" — they make opposite trade-offs between index cost at
write time and scan cost at query time.

---

## 9. Shutting it down

```bash
docker compose down        # stop, keep the data volume
docker compose down -v     # also delete indexed data
```

Use `-v` if disk space is tight — indices grow.

---

## 10. Common failures

| Symptom | Cause |
|---|---|
| Elasticsearch exits ~code 137 | **OOM-killed.** Stop other stacks; it needs its 2 GB |
| `max virtual memory areas vm.max_map_count [65530] is too low` | WSL kernel setting: `wsl -d docker-desktop -u root sysctl -w vm.max_map_count=262144` |
| Kibana "server is not ready yet" | Still waiting on Elasticsearch — give it 90 s |
| No data in Discover | Data view not created, or time range too narrow (try "Last 1 hour") |
| Logstash restarting | Pipeline syntax error — `docker compose logs logstash` |
| Status yellow | **Expected** on a single node (§4) |
