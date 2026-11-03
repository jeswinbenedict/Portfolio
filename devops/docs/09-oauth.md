# OAuth 2.0 Login (GitHub)

A working GitHub sign-in on the portfolio: `/login` → GitHub consent →
`/dashboard`, with the route guarded and the session held in a signed cookie.

Built **without** an auth library (no NextAuth), so every step of the flow is
visible and explainable — which is the point for a viva.

---

## 1. What OAuth actually solves

Without OAuth, letting someone "sign in with GitHub" would mean asking for
their GitHub password. That is catastrophic: you would possess a credential
that works everywhere on GitHub.

OAuth 2.0 is **delegated authorisation**. The user authenticates on *GitHub's*
own page. GitHub then hands your app a short-lived token that grants only the
narrow permission the user approved. Your app never sees the password.

> If the examiner asks one question about OAuth, it will be *"why not just
> take the password?"* — that paragraph is the answer.

---

## 2. The flow, step by step

```
  Browser                 Your app                     GitHub
     │                       │                            │
     │ 1. click "Sign in"    │                            │
     ├──────────────────────►│                            │
     │                       │ 2. redirect to authorize   │
     │◄──────────────────────┤    (client_id + state)     │
     │                                                    │
     │ 3. user approves on github.com                     │
     ├───────────────────────────────────────────────────►│
     │                                                    │
     │ 4. redirect back: ?code=...&state=...              │
     │◄───────────────────────────────────────────────────┤
     ├──────────────────────►│                            │
     │                       │ 5. verify state (CSRF)     │
     │                       │ 6. POST code+secret ──────►│
     │                       │◄────────── access_token    │
     │                       │ 7. GET /user ─────────────►│
     │                       │◄────────── profile         │
     │                       │ 8. set our session cookie  │
     │◄──────────────────────┤    redirect /dashboard     │
```

**Steps 6 and 7 happen server-side.** That is what keeps `client_secret` out
of the browser. If the secret were in client code, anyone could impersonate
your application.

---

## 3. The files

| File | Role |
|---|---|
| `lib/auth/github.ts` | Builds the authorize URL, exchanges the code, fetches the profile |
| `lib/auth/session.ts` | Signs/verifies the session JWT, manages the cookie |
| `app/api/auth/github/route.ts` | Step 2 — generates `state`, redirects to GitHub |
| `app/api/auth/callback/github/route.ts` | Steps 5–8 — the callback |
| `app/api/auth/logout/route.ts` | Clears the cookie (POST only) |
| `app/login/page.tsx` | The sign-in page |
| `app/dashboard/page.tsx` | Protected page |
| `proxy.ts` | Route guard — **not** `middleware.ts`, see §7 |

---

## 4. Setting it up

### Register the OAuth App

1. github.com → Settings → Developer settings → **OAuth Apps** → New
2. Fill in:
   - **Application name**: `Portfolio Local`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**:
     `http://localhost:3000/api/auth/callback/github`
3. Register, then **Generate a new client secret** and copy it immediately —
   GitHub shows it once.

> The callback URL must match **exactly**: scheme, host, port, path, no
> trailing slash. A mismatch gives `redirect_uri_mismatch`.

### Configure the app

```bash
openssl rand -base64 32      # or: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

In `.env.local` (already created, already gitignored):

```bash
SESSION_SECRET=<the generated value>
GITHUB_CLIENT_ID=<from GitHub>
GITHUB_CLIENT_SECRET=<from GitHub>
APP_BASE_URL=http://localhost:3000
```

Restart the server — env vars are read at boot.

---

## 5. Three security details worth explaining

**`state` — CSRF protection.** A random value sent to GitHub and echoed back.
The callback rejects the request if it does not match the cookie. Without it,
an attacker could hand you a callback URL carrying *their* code and log you
into *their* account (session fixation).

**`httpOnly` cookie — XSS protection.** Page JavaScript cannot read the
session cookie. If an attacker injected a script, it still could not steal
the session. A token in `localStorage` would be readable immediately.

**The GitHub token is discarded.** After reading the profile we throw the
access token away and mint our own session. Storing it would mean holding a
live credential that can act on the user's GitHub account — a liability with
no benefit, since we only needed to learn who they are.

Also note `scope: "read:user"` — the narrowest scope that returns a profile.
Request the least you need.

---

## 6. Two layers of protection

`proxy.ts` does an **optimistic** check and redirects early. `app/dashboard/
page.tsx` checks **again**.

This is not redundancy for its own sake. The Next.js docs are explicit that
proxy checks are optimistic: proxy runs on prefetched routes too, so it must
stay cheap (cookie only, no database). The authoritative check belongs next
to the data it protects.

---

## 7. ⚠ Next.js 16: `middleware.ts` is now `proxy.ts`

This version **deprecated `middleware.js` and renamed it to `proxy.js`**. The
default export is `proxy`, not `middleware`. Functionality is identical.

A `middleware.ts` file in this project would be **silently ignored** — the
route guard simply would not run, with no error. Confirm it is active by
looking for this line in `npm run build` output:

```
ƒ Proxy (Middleware)
```

Automatic migration for old code:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

Two other Next.js 16 changes used here: `cookies()` is **async**
(`await cookies()`), and a page's `searchParams` is a **Promise**.

---

## 8. Verifying it works

```bash
npm run build && npm start
```

| Request | Expected |
|---|---|
| `GET /` | 200 — public |
| `GET /login` | 200 |
| `GET /dashboard` (no session) | **307 → /login** |
| `GET /api/auth/github` (no creds) | 503 + hint |
| `GET /login?error=state_mismatch` | renders the CSRF failure message |

Measured on this machine:

```
/                 200
/login            200
/dashboard        307  → http://localhost:3000/login
/api/auth/github  {"error":"GitHub OAuth is not configured.", ...}
```

Once credentials are set, the full round trip ends on `/dashboard` showing
your GitHub avatar, name, handle and session expiry.

Screenshot: `oauth-login.png`

---

## 9. ⚠ Where OAuth will and will not run

OAuth needs a **server** — the callback and token exchange are server-side.

| Deployment | Works? |
|---|---|
| `npm start` locally | ✅ |
| Docker container | ✅ |
| AWS EC2 | ✅ (set `APP_BASE_URL` to the public IP, and register that callback URL) |
| Kubernetes / Minikube | ✅ |
| Vercel | ✅ |
| **GitHub Pages** | ❌ **No.** |

GitHub Pages serves static files only — it cannot execute route handlers. The
Actions workflow exports static HTML, so on `jeswinbenedict.github.io` the
`/login` page renders but the sign-in button leads nowhere.

**This is not a bug to fix** — it is the inherent difference between static
hosting and a server runtime, and is worth being able to state plainly. Demo
OAuth from Docker, EC2 or local; demo GitHub Pages for the static build.

---

## 10. Changing environments

Each environment needs its **own** registered callback URL. Either add several
to one OAuth App, or register one App per environment:

| Environment | `APP_BASE_URL` | Callback to register |
|---|---|---|
| Local | `http://localhost:3000` | `http://localhost:3000/api/auth/callback/github` |
| EC2 | `http://<ip>:3000` | `http://<ip>:3000/api/auth/callback/github` |
| Domain | `https://yourdomain.com` | `https://yourdomain.com/api/auth/callback/github` |

Forgetting this is the single most common OAuth failure:
`redirect_uri_mismatch`.
