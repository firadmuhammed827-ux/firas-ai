# Deploying Firas AI (free) — نشر فِراس AI مجاناً

Firas AI is **one long-running Node server** (`server.mjs`) with a small file
database. It needs a host that runs a permanent process — **NOT** Netlify/Vercel
(those only run short serverless functions and have no permanent database, so
login, history, images, and search all break there).

## ⭐ Recommended free path: Render (host) + Firebase (database) — NO credit card
- **Render** runs the long-running server on its free tier with **no credit card**
  (sign up with GitHub/Google/email). Its only catch is no persistent disk.
- So store the database in **Firebase Realtime Database** (free, no card — you set
  `FIREBASE_DB_URL` + `FIREBASE_SERVICE_ACCOUNT`, see §3). Then accounts and chat
  history **persist** even though Render's disk is ephemeral. This is the whole
  free + no-card + durable combination.

| Host | Free / no card | Accounts persist | Notes |
|------|----------------|------------------|-------|
| **Render + Firebase** (recommended) | ✅ no card | ✅ yes (Firebase) | sleeps after 15 min idle → first request ~30-60s |
| Fly.io | ✅ but needs a card | ✅ (free volume) | alternative; see fly.toml |

Set the environment variables in **§3** and do the Firebase auth-domain step in **§4**.

---

## 1) Push the project to GitHub
```bash
git init && git add -A && git commit -m "Firas AI"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/firas-ai.git
git push -u origin main
```
`.gitignore` already excludes `data/` and `.env` (your DB + secrets stay private).

---

## 2A) Deploy on Fly.io  (free + durable data — RECOMMENDED)
1. Install the CLI and sign in (a card is required for verification but the free
   allowance does not charge):
   ```bash
   # Windows PowerShell:
   iwr https://fly.io/install.ps1 -useb | iex
   fly auth signup        # or: fly auth login
   ```
2. From the project folder, create the app (pick a unique name + a region near
   you when prompted; say NO to deploying yet):
   ```bash
   fly launch --no-deploy
   ```
   This reuses the included `fly.toml` / `Dockerfile`.
3. Create the persistent disk (same region you chose):
   ```bash
   fly volumes create firas_data --size 1 --region <your-region>
   ```
4. Set the secrets (see §3 for what each is):
   ```bash
   fly secrets set SESSION_SECRET=$(openssl rand -hex 32) ^
                   OLLAMA_API_KEY=<your-ollama-cloud-key> ^
                   FIREBASE_PROJECT_ID=firas-ai
   ```
   (No `openssl`? Use any long random string for `SESSION_SECRET`.)
5. Deploy:
   ```bash
   fly deploy
   ```
   Your site is at `https://<app-name>.fly.dev`.

## 2B) Deploy on Render + Firebase  (free, no card, durable — RECOMMENDED)
**First, set up Firebase persistence (free, no card):**
1. Firebase Console → your project → **Build → Realtime Database → Create
   Database** (pick a region, "locked mode" is fine). Copy the database URL
   (looks like `https://<project>-default-rtdb.firebaseio.com`).
2. **Project Settings → Service accounts → Generate new private key** → a JSON
   file downloads. Keep it safe (it's an admin credential).

**Then deploy on Render:**
3. Push to GitHub (§1).
4. On <https://render.com> → sign up (GitHub/Google, **no card**) → **New +** →
   **Blueprint** → pick your repo (reads `render.yaml`).
5. In the service's **Environment** tab add these secrets:
   - `OLLAMA_API_KEY` = your Ollama key
   - `FIREBASE_DB_URL` = the URL from step 1
   - `FIREBASE_SERVICE_ACCOUNT` = the **entire** JSON from step 2 (paste as one value)
   - (`SESSION_SECRET` is generated automatically; `FIREBASE_PROJECT_ID=firas-ai`)
6. Deploy. Your site is at `https://<name>.onrender.com`. With Firebase set, the
   startup log shows `database: Firebase Realtime Database` and accounts/history
   now **persist** across the free-tier restarts. (First request after a 15-min
   idle is slow ~30-60s — that's the only free-tier catch; no data is lost.)

---

## 3) Environment variables (set these on the host, not in code)
| Var | Required? | Value | Why |
|-----|-----------|-------|-----|
| `SESSION_SECRET` | **yes** | a long random string | Signs login cookies; without it everyone is logged out on restart |
| `OLLAMA_HOST` | yes | `https://ollama.com` | The AI engine (a deployed box has no local Ollama) — already set in fly.toml/render.yaml |
| `OLLAMA_API_KEY` | **strongly** | your key from <https://ollama.com> (account → keys) | Unlocks the 3 tiers + vision. Without it the app still works but degrades to the single free keyless engine (no vision) |
| `FIREBASE_PROJECT_ID` | for Google/email login | `firas-ai` | Verifies Firebase sign-in tokens |
| `FIREBASE_DB_URL` | **for durable data on Render** | `https://<project>-default-rtdb.firebaseio.com` | Stores the DB in Firebase so accounts/history persist on disk-less free hosts |
| `FIREBASE_SERVICE_ACCOUNT` | with `FIREBASE_DB_URL` | the full service-account JSON (one line) | Admin auth to the database (locked-mode is fine) |
| `DATA_DIR` | only without Firebase | `/data` | Local DB path (used when Firebase vars are unset, e.g. Fly volume) |
| `SECURE_COOKIES` | yes (HTTPS) | `1` | Marks cookies HTTPS-only — already set |
| `NODE_ENV` | yes | `production` | Enables the startup readiness checks — already set |

---

## 4) Firebase — allow your new domain (else Google sign-in fails)
Firebase Console → your project (**firas-ai**) → **Authentication → Settings →
Authorized domains → Add domain**, and add your deploy host, e.g.
`firas-ai.fly.dev` or `firas-ai.onrender.com`. Without this, Google sign-in
fails with `auth/unauthorized-domain` (email/password still works).

---

## 5) After deploying — smoke test
Open the site and verify, signed in: send a chat, switch tiers, make a file
(PDF/Word/Excel/PPTX), generate an image, run a web search, and reload to confirm
history persisted. The startup logs (host dashboard → Logs) will warn if any
required env var is missing.

### Notes
- Run a **single instance** — the JSON DB is not safe across multiple instances
  (Fly is pinned to 1 via `min_machines_running = 1`).
- The keyless fallbacks (pollinations images, DuckDuckGo search) are best-effort
  and can be rate-limited from datacenter IPs; the core chat relies on Ollama
  Cloud via your `OLLAMA_API_KEY`.
- `vercel.json` is left only for an anonymous-chat-only Vercel demo; it does NOT
  serve the full app. Use Fly.io/Render above for the real deployment.
