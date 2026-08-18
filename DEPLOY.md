# Deployment: GitHub → Lightsail (Ubuntu 24.04), no Docker

Node.js runs the app directly on the instance, PM2 keeps it alive and restarts
it on reboot, and Caddy (installed as a native systemd service) terminates TLS
and reverse-proxies to it. The database stays at Supabase, nothing is stored on
the instance.

Assumptions: 1 GB instance, public GitHub repo, a domain you control.

---

## Step 0 — one change already made to your folder

`next.config.ts` had `output: "standalone"`. That setting makes Next.js produce
a pruned, self-contained server folder meant to be copied into a minimal Docker
image, it has no purpose without Docker and only adds build time and disk use.
It has been removed. Nothing else changes: `npm run build` and `npm start`
behave the same either way for a normal Node deployment.

The `Dockerfile`, `docker-compose.yml`, `Caddyfile` and `.dockerignore` at the
root are unused by this path. You can leave them in the repo for later or
delete them, your choice, they don't interfere with what follows.

---

## Step 1 — push to GitHub

Create the repository on github.com first: **omarchaouki / prepa-physique**,
public, **without** README, .gitignore or licence (an empty repo, otherwise the
first push is rejected).

Then in PowerShell:

```powershell
cd "C:\Users\OMAR\Desktop\antel skills\prepa physique"
git init
git add .
git status
```

**Before committing, check that `.env` is not in the list.** It's covered by
`.gitignore`, but verify, because a leaked Supabase password means anyone can
read and delete your data:

```powershell
git ls-files | Select-String "^\.env"
```

The only line printed must be `.env.example`. If `.env` appears:

```powershell
git rm --cached .env
```

Then commit and push:

```powershell
git commit -m "Prepa Physique, deployable version"
git branch -M main
git remote add origin https://github.com/omarchaouki/prepa-physique.git
git push -u origin main
```

If git asks for credentials, use your GitHub username and a **personal access
token** as the password (Settings → Developer settings → Tokens), GitHub no
longer accepts account passwords for this.

---

## Step 2 — Lightsail: static IP, firewall, DNS

In the Lightsail console:

1. **Networking → Create static IP → attach it to your instance.** Without
   this, the IP changes on every stop/start and your DNS record goes stale.
2. Instance → **Networking → IPv4 Firewall**, make sure these rules exist:

   | Application | Protocol | Port |
   |---|---|---|
   | SSH | TCP | 22 |
   | HTTP | TCP | 80 |
   | HTTPS | TCP | 443 |
   | Custom | UDP | 443 |

   Port 80 is not optional even though the site runs on HTTPS: Let's Encrypt
   uses it to validate the certificate. UDP 443 is for HTTP/3, a bonus.

3. At your DNS registrar, create an **A record** pointing to the static IP.
   Example: `prepa` → `13.38.x.x`, giving `prepa.yourdomain.com`.

Wait for propagation, then verify from your PC:

```powershell
nslookup prepa.yourdomain.com
```

Don't start Caddy before this resolves correctly. A failed certificate request
counts against Let's Encrypt rate limits (5 failures per hostname per hour).

---

## Step 3 — connect and prepare the system

```bash
ssh -i LightsailDefaultKey.pem ubuntu@13.38.x.x
sudo apt update && sudo apt upgrade -y
```

### Swap: mandatory on 1 GB

The build (`prisma generate` + `next build`) needs roughly 1.5 GB. With 1 GB of
RAM and no swap the process gets killed by the OOM killer, usually with
`Killed` and no clear error.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

`free -h` must show 2.0Gi on the Swap line. The `fstab` line makes it survive a
reboot.

**Swap alone is not enough.** There are two different out-of-memory failures,
and they need two different fixes:

| What you see | Who killed it | Fix |
|---|---|---|
| `Killed`, no other output | the kernel's OOM killer | swap, above |
| `FATAL ERROR: ... JavaScript heap out of memory` | V8's own ceiling | raise the limit, below |

Node sizes its heap from the RAM it detects. On a 1 GB instance that ceiling
lands around 460 MB, and the type-checking phase of `next build` now needs more
than that. V8 refuses to grow past its own limit even when swap is free, so the
limit has to be raised explicitly:

```bash
SKIP_BUILD_CHECKS=1 NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

**Both variables are needed on this instance.** They do different things:

- `NODE_OPTIONS` lets V8 grow past the ceiling it picks from detected RAM.
- `SKIP_BUILD_CHECKS=1` turns off type checking and linting during the build,
  and drops Next.js to a single build worker instead of one per core.

Type checking is the phase that dies, and it is redundant here: the code
arrived by `git pull`, so it is exactly the code already checked on the
development machine. Next.js prints `Skipping validation of types` when the
variable is active, which is how you confirm it was picked up.

The rule that comes with it is not negotiable: **`npm run typecheck` must pass
before every `git push`**. Nothing checks types on the server any more.

---

## Step 4 — install Node.js 22 and PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node --version      # v22.x
npm --version
sudo npm install -g pm2
```

`node -v` must print a v22 version, matching the version the project was built
against (`node:22-alpine` in the now-unused Dockerfile). A mismatched major
version is a common source of native module errors (Prisma's engine binaries
in particular are version- and platform-specific).

---

## Step 5 — install Caddy (reverse proxy, automatic HTTPS)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

Caddy is now running as a systemd service with a default, empty config. Leave
it as is for now, it's configured in step 8 once the domain and app are ready.

---

## Step 6 — clone and build

```bash
cd ~
git clone https://github.com/omarchaouki/prepa-physique.git
cd prepa-physique
npm ci
```

Do **not** run `export NODE_ENV=production` before `npm ci`: that would skip
`devDependencies`, which include `typescript`, `prisma` and `tsx`, all needed
for the build and for the seed script.

Create `.env` by hand, it's deliberately not in the repository:

```bash
nano .env
```

```dotenv
DATABASE_URL="postgresql://postgres.cgnjvtcrouxlqqbxmdym:MOTDEPASSE@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20"
DIRECT_URL="postgresql://postgres.cgnjvtcrouxlqqbxmdym:MOTDEPASSE@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"

AUTH_SECRET="valeur-generee-ci-dessous"

OWNER_EMAIL="owner@prepaphysique.app"
OWNER_PASSWORD="un-mot-de-passe-fort"
OWNER_NAME="Omar"

NODE_ENV="production"
PORT=3000
```

Copy the two database URLs from your local `.env`, they're already correct,
including the URL-encoding of the password (`@` → `%40`, `$` → `%24`). Keep
that encoding.

Generate a **new** secret for production, don't reuse the development one:

```bash
openssl rand -base64 48
```

Paste it into `AUTH_SECRET` in the file you just opened, then protect it:

```bash
chmod 600 .env
```

Next.js loads `.env` automatically, both at build time and at runtime, so this
single file covers everything, no separate step to pass variables into a
container.

Build:

```bash
npm run build
```

This runs `prisma generate` then `next build` (see `package.json`). On a 1 GB
instance with swap it takes a few minutes.

---

## Step 7 — schema and seed

```bash
npm run db:push
```

This runs `prisma db push`, which uses `DIRECT_URL` (port 5432, session mode),
because the transaction-mode pooler on 6543 can't run schema statements.

Then, **only if the Supabase database is still empty**, load the reference data
and the owner account:

```bash
npx tsx scripts/check-connection.ts
```

If it prints `Schema public vide : aucune table.`, or shows tables with 0 rows,
seed:

```bash
npm run db:seed
```

If you already ran the seed from your PC against this same Supabase project,
skip it, a second run would either fail on unique constraints or duplicate the
reference data.

---

## Step 8 — start the app with PM2

```bash
cd ~/prepa-physique
pm2 start npm --name prepa-physique -- start
pm2 save
pm2 startup systemd
```

`pm2 startup` prints a `sudo env PATH=... pm2 startup systemd -u ubuntu ...`
command, copy and run exactly that line, it registers PM2 as a boot service so
the app survives a reboot.

Check it's actually listening:

```bash
curl -I http://localhost:3000/login
pm2 status
pm2 logs prepa-physique --lines 50
```

Expect `HTTP/1.1 200 OK` and `online` in `pm2 status`.

---

## Step 9 — configure Caddy and go live

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the whole file with, using your real domain:

```
prepa.yourdomain.com {
	encode zstd gzip

	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "SAMEORIGIN"
		Referrer-Policy "strict-origin-when-cross-origin"
		-Server
	}

	reverse_proxy localhost:3000 {
		flush_interval -1
	}
}
```

Reload:

```bash
sudo systemctl reload caddy
sudo systemctl status caddy
```

Caddy requests and installs the certificate automatically on the first
request, this only works if the domain already resolves to this instance (step
2) and port 80 is open.

---

## Step 10 — verify

```bash
curl -I https://prepa.yourdomain.com/login
```

Expect `HTTP/2 200`. Then open the site in a browser and log in with
`OWNER_EMAIL` / `OWNER_PASSWORD`.

If the certificate isn't issued, read Caddy's logs, they say exactly what
Let's Encrypt refused:

```bash
sudo journalctl -u caddy --no-pager | tail -60
```

---

## Daily operations

Deploy a new version, after pushing to GitHub from your PC:

```bash
cd ~/prepa-physique
git pull
npm ci
SKIP_BUILD_CHECKS=1 NODE_OPTIONS="--max-old-space-size=1536" npm run build
pm2 restart prepa-physique
```

The `NODE_OPTIONS` prefix is not optional on a 1 GB instance. Without it the
build dies with `JavaScript heap out of memory` during type checking, even with
swap active. See step 3.

If `prisma/schema.prisma` changed:

```bash
npm run db:push
```

Other useful commands:

```bash
pm2 logs prepa-physique     # live application logs
pm2 restart prepa-physique  # restart without rebuilding
pm2 stop prepa-physique     # stop
pm2 monit                   # live RAM and CPU
df -h                       # remaining disk
```

---

## Two things that will bite you later

**Backups.** Everything lives in Supabase, so an instance failure costs you
nothing, but a bad `db push` or a wrong delete does. Supabase's free tier keeps
daily backups for a short window only. Take your own dump periodically, from
the instance:

```bash
sudo apt install -y postgresql-client-16
set -a; . ~/prepa-physique/.env; set +a
pg_dump "$DIRECT_URL" -Fc -f ~/backup-$(date +%F).dump
```

Use `DIRECT_URL` (port 5432), `pg_dump` doesn't work through the
transaction-mode pooler. Copy the dump off the instance, a backup that lives on
the machine it protects isn't a backup.

**Supabase free-tier pausing.** A free project is paused after about a week
without activity, and the site then returns database errors until you resume it
from the dashboard. A production site normally gets enough traffic to stay
awake, a demo nobody visits won't.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm run build` killed, no clear error | Kernel OOM killer | Swap from step 3; `free -h` to confirm it's active |
| `FATAL ERROR: ... JavaScript heap out of memory` | V8's own heap ceiling, not the kernel | Add `NODE_OPTIONS="--max-old-space-size=1536"`. Swap alone does not fix this |
| `Static worker exited ... SIGABRT` | Parallel build workers, each holding its own copy of the module graph | Add `SKIP_BUILD_CHECKS=1`, which also drops to a single worker |
| Build succeeds but `prisma generate` step complains about missing deps | `NODE_ENV=production` was exported before `npm ci` | `unset NODE_ENV`, re-run `npm ci` |
| `P1001: Can't reach database server` | Wrong host, or `db.<ref>.supabase.co` used | Both URLs must go through `...pooler.supabase.com`, the direct host is IPv6-only |
| `password authentication failed` | `@` or `$` not URL-encoded | `%40` and `%24` in the URL |
| `npm run db:push` hangs or times out | Using port 6543 for the schema | `DIRECT_URL` must use port 5432 |
| `pm2 status` shows `errored`, restarting in a loop | App crashed at startup | `pm2 logs prepa-physique`, usually a missing or malformed variable in `.env` |
| Caddy won't get a certificate | DNS not propagated, or port 80 closed | `nslookup` the domain, check the Lightsail firewall |
| App survives `pm2 restart` but not a reboot | `pm2 startup` command wasn't run, or `pm2 save` skipped | Re-run both from step 8 |
| Prisma engine error mentioning `libssl` | Rare on Ubuntu 24, missing OpenSSL runtime | `sudo apt install -y openssl` |
