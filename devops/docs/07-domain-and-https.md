# Custom Domain + HTTPS + Cloudflare

Covers buying a domain, pointing it at your server, putting nginx in front of
the container, and getting a free TLS certificate.

> **I cannot buy the domain for you** — that is a purchase with your payment
> details. Everything else below I have prepared; the config is in
> `devops/nginx/portfolio.conf`.

---

## 1. Buying a domain

| Registrar | Typical first year | Notes |
|---|---|---|
| **Namecheap** | ₹700–900 (`.com`) | Free WHOIS privacy — recommended |
| **GoDaddy** | ₹99 first year, then ~₹1,200 | Cheap year 1, upsells heavily at checkout |
| **Cloudflare Registrar** | at-cost (~₹900) | No markup, but domain must already be on Cloudflare |

**Free alternatives if you would rather not pay** — these give a real hostname
and work with Let's Encrypt, so the demo is identical:

- **DuckDNS** (`yourname.duckdns.org`) — free, 2 minutes to set up
- **nip.io** — no signup at all: `56.228.18.13.nip.io` resolves to that IP
  automatically. Good enough to demonstrate name-based virtual hosting.

**At checkout:** decline the add-ons (hosting, email, SSL — you get SSL free
from Let's Encrypt). Enable WHOIS privacy if offered free.

---

## 2. Pointing the domain at your server

DNS maps a name to an address. You need two records:

| Type | Name | Value | Meaning |
|---|---|---|---|
| `A` | `@` | `<your-EC2-public-IP>` | the bare domain → your server |
| `CNAME` | `www` | `yourdomain.com` | `www.` → whatever the bare domain points at |

`@` means the domain itself. **TTL** is how long resolvers cache the answer —
set 300 (5 min) while testing so mistakes are quick to correct.

**Check it propagated** (can take 5 minutes to a few hours):

```bash
nslookup yourdomain.com
dig +short yourdomain.com
```

> ⚠ **An EC2 public IP changes every time the instance stops and starts.** For
> a domain you need a stable address: allocate an **Elastic IP** in the EC2
> console and associate it with the instance. It is free while attached to a
> *running* instance, and charged if left unattached — so release it when you
> terminate.

---

## 3. nginx reverse proxy

The container listens on 3000. nginx takes 80/443 and forwards to it.

**Why not just publish the container on port 80?** Because then you have no
place to terminate TLS, set security headers, cache static assets, or serve
several sites from one machine. nginx does all of that without touching the app.

```bash
# on the EC2 instance
sudo apt-get update && sudo apt-get install -y nginx

# copy the config from this repo
sudo cp portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default      # remove the "Welcome" page

sudo nginx -t          # ALWAYS test the syntax first
sudo systemctl reload nginx
```

Edit `server_name` in the config to your real domain before reloading.

**The important lines, and why:**

```nginx
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Without these the app sees every request as coming from `127.0.0.1` over
`http`, so logs are useless and any absolute URL it generates is wrong.

Also bind the container to loopback only, so nobody can bypass nginx:

```bash
docker run -d --name portfolio -p 127.0.0.1:3000:3000 jechuimmanuel/portfolio:v2
```

---

## 4. HTTPS with Let's Encrypt

Let's Encrypt issues free, browser-trusted certificates valid 90 days.
Certbot automates both issuing and renewal.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will:
1. Prove you control the domain (HTTP-01 challenge — it serves a token at
   `/.well-known/acme-challenge/` and Let's Encrypt fetches it, which is why
   **port 80 must be open and DNS must already resolve**)
2. Obtain the certificate
3. **Edit your nginx config in place** to add the TLS block and an HTTP→HTTPS redirect
4. Install a systemd timer that renews automatically

**Verify renewal works:**

```bash
sudo certbot renew --dry-run
systemctl list-timers | grep certbot
```

### Common failures

| Error | Cause |
|---|---|
| `Timeout during connect` | Port 80 closed in the AWS security group |
| `DNS problem: NXDOMAIN` | DNS has not propagated yet — wait and retry |
| `too many certificates already issued` | Rate limit: 5 per domain per week. Use `--dry-run` while testing |

---

## 4b. GoDaddy → Cloudflare, step by step

This is the exact path for this project: buy at GoDaddy, then hand DNS to
Cloudflare. You keep GoDaddy as the *registrar* (who owns the registration)
but Cloudflare becomes the *nameserver* (who answers DNS queries).

### Step 1 — Buy at GoDaddy

1. Search your domain at godaddy.com
2. **Decline every add-on at checkout** — Website Builder, Microsoft 365,
   "Full Domain Privacy", and especially **SSL**. You get SSL free from
   Let's Encrypt and privacy free from Cloudflare.
3. Watch the renewal price, not the first-year price. GoDaddy's ₹99 offers
   renew around ₹1,200.

### Step 2 — Add the site to Cloudflare

1. dash.cloudflare.com → **Add a domain**
2. Enter the domain, choose the **Free** plan
3. Cloudflare scans existing DNS and shows two nameservers, e.g.
   `aria.ns.cloudflare.com` / `rex.ns.cloudflare.com` — **copy both**

### Step 3 — Point GoDaddy at Cloudflare

1. GoDaddy → **My Products** → your domain → **DNS** → **Nameservers**
2. **Change** → **I'll use my own nameservers**
3. Replace both entries with Cloudflare's, save
4. Back in Cloudflare, click **Check nameservers now**

Propagation is usually 5–30 minutes, occasionally up to 24 hours. Verify:

```bash
dig +short NS yourdomain.com      # should return the Cloudflare nameservers
```

### Step 4 — DNS records in Cloudflare

Add these in Cloudflare's DNS tab (not GoDaddy's — GoDaddy's are now ignored):

| Type | Name | Content | Proxy |
|---|---|---|---|
| `A` | `@` | your EC2 Elastic IP | Proxied 🟠 |
| `CNAME` | `www` | `yourdomain.com` | Proxied 🟠 |

### Step 5 — Order of operations for SSL

This trips people up. Let's Encrypt's HTTP-01 challenge must reach **your
server**, but Cloudflare's proxy hides it. So:

1. Set both records to **DNS only** (grey cloud) first
2. Run `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`
3. Once the certificate is installed, switch both back to **Proxied** (orange)
4. Set SSL/TLS mode to **Full (strict)**

Doing it in the other order gives `Timeout during connect` from certbot.

> **One common mistake:** after moving nameservers to Cloudflare, editing DNS
> in the GoDaddy panel does nothing. All DNS changes now happen in Cloudflare.

---

## 5. Cloudflare

Cloudflare sits between visitors and your server as a reverse proxy, giving
you a CDN, DDoS protection, caching and free TLS.

**Setup:**
1. Sign up at cloudflare.com, *Add a site*, enter your domain
2. It scans your existing DNS records — confirm the `A` and `CNAME` from §2
3. It gives you two **nameservers**
4. At your registrar, replace the default nameservers with Cloudflare's
5. Wait for "Active" (5 minutes to 24 hours)

**Key settings:**

| Setting | Value | Why |
|---|---|---|
| Proxy status | **Proxied** (orange cloud) | Traffic flows through Cloudflare; your real IP is hidden |
| SSL/TLS mode | **Full (strict)** | Encrypts Cloudflare→origin *and* validates your cert |
| Always Use HTTPS | On | Redirects http→https at the edge |

> ⚠ **Do not use "Flexible" SSL.** It encrypts browser→Cloudflare but sends
> plain HTTP to your server, while showing visitors a padlock. That is
> misleading and insecure. Get the Let's Encrypt cert working first, then use
> Full (strict).

**Caution:** once proxied, your origin IP is hidden — but Let's Encrypt's
HTTP-01 challenge still needs to reach your server. Either pause Cloudflare
while issuing the certificate, or use DNS-01 validation instead.

---

## 6. Verifying end to end

```bash
dig +short yourdomain.com                       # DNS resolves
curl -I http://yourdomain.com                   # 301 redirect to https
curl -I https://yourdomain.com                  # 200 OK
curl -sI https://yourdomain.com | grep -i strict # HSTS header present
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 7. Practising this offline

You can demonstrate name-based virtual hosting and even TLS with **no domain
and no internet**:

**Fake a domain** — add to `C:\Windows\System32\drivers\etc\hosts`
(edit as Administrator):

```
127.0.0.1    portfolio.local
```

Now `http://portfolio.local` reaches your local container, and nginx's
`server_name portfolio.local;` matches. This is exactly how real DNS works,
just resolved from a file instead of a server.

**Fake a certificate** — a self-signed cert proves the TLS mechanics:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout portfolio.key -out portfolio.crt \
  -subj "/CN=portfolio.local"
```

The browser will warn that it is untrusted — correct, because no public CA
signed it. The encryption is real; only the *trust chain* is missing. That
distinction is worth being able to explain.
