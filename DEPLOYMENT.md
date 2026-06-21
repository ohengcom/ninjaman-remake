# Deployment Guide

Ninja Man Remake ships **two independent web builds** from a single repository, each deployed to its own Vercel project for side-by-side comparison.

| | Phaser build | Godot build |
|---|---|---|
| Source | `phaser/` | `godot/` |
| Stack | Phaser 4 + TypeScript + Vite | Godot 4.6.3 + GDScript |
| Vercel project root | `.` (repo root) | `godot` |
| Config file | `vercel.json` | `godot/vercel.json` |
| Build location | Vercel runs `npm run build` → `dist/` | GitHub Action exports → `godot/build/web/` |
| Artifacts in git | No (`dist/` ignored) | No (`godot/build/` ignored) |
| Deploy trigger | Push to `main` (Vercel auto-build) | Push to `main` touching `godot/**` (GitHub Action) |

---

## Phaser deployment (automatic)

Vercel watches the `main` branch. On push it runs `npm run build` and serves `dist/`.

- **Config**: `vercel.json` (root)
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **No secrets required** — Vercel builds from source.

Local preview:
```bash
npm run build
npm run preview
```

---

## Godot deployment (GitHub Action → Vercel)

Vercel cannot build Godot (no Godot CLI / export templates in its build environment), so the Godot build is produced by a GitHub Action on Linux and deployed to Vercel as prebuilt static files.

### One-time setup (Vercel dashboard + GitHub)

1. **Create a second Vercel project** pointing at the same GitHub repo.
   - Project name: e.g. `ninjaman-godot`
   - Root Directory: `godot`
   - Framework Preset: `Other`
   - Build Command: **leave empty** (set `vercel build` is done in CI)
   - Output Directory: `build/web`
   - Production Branch: `main`

2. **Collect three values** from Vercel:
   - `VERCEL_TOKEN` — create at https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` — found in project Settings → General (team/user ID)
   - `VERCEL_PROJECT_ID` — found in project Settings → General (the Godot project's ID)

3. **Add them as GitHub secrets** in the repo (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_GODOT_PROJECT_ID`

### How it works

`.github/workflows/deploy-godot.yml`:
1. Triggers on push to `main` when `godot/**` or the export script changes (also runnable manually via `workflow_dispatch`).
2. Installs Godot 4.6.3 + Web export templates on Ubuntu (`barichello/godot-ci`).
3. Runs `node scripts/export_godot_web.js` → outputs `godot/build/web/`.
4. Runs `vercel build` (in `godot/`) to package `build/web/` into Vercel Build Output.
5. Runs `vercel deploy --prebuilt --prod` to ship the prebuilt output.

> **Note**: The Windows CLI hang at 98% (documented historically) is a Windows-only issue; the Linux headless export used by the Action is reliable.

### Manual local export (fallback)

If the Action is unavailable, export from the Godot Editor and deploy by hand:

```bash
# Option A: Godot Editor → Project > Export > Web → save to godot/build/web/index.html
# Option B: local CLI (may hang on Windows at 98%)
GODOT_BIN=/path/to/godot npm run build:godot:web

# Then deploy the prebuilt output
cd godot
npx vercel build --yes
npx vercel deploy --prebuilt --prod --yes
```

---

## Verification checklist

After both deployments finish:

- [ ] Phaser URL loads main menu and gameplay (keyboard + gamepad)
- [ ] Godot URL shows Godot loading screen → main menu → playable
- [ ] `npm run typecheck && npm test && npm run build` pass locally
- [ ] GitHub Action for Godot shows green on the latest `godot/**` push

---

## Switching the default Vercel project

The repo root `vercel.json` is the **Phaser** config. The Godot config lives at `godot/vercel.json` and is only read by the Godot Vercel project (Root = `godot`). The two never interfere — do not copy one over the other.
