# Deployment Guide

Ninja Man Remake ships **two independent web builds** from a single repository, each deployed to its own Vercel project for side-by-side comparison.

| | Phaser build | Godot build |
|---|---|---|
| Source | `phaser/` | `godot/` |
| Stack | Phaser 4 + TypeScript + Vite | Godot 4.6.3 + GDScript |
| Vercel project root | `.` (repo root) | `godot` |
| Config file | `vercel.json` | `godot/vercel.json` |
| Build location | Vercel runs `npm run build` → `dist/` | Pre-built `godot/build/web/` committed to git |
| Artifacts in git | No (`dist/` ignored) | Yes (`godot/build/web/` committed for static hosting) |
| Deploy trigger | Push to `main` (Vercel auto-build) | Push to `main` (Vercel serves committed files) |
| Secrets required | None | None |

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

## Godot deployment (static hosting, no CI, no secrets)

Vercel cannot build Godot (no Godot CLI / export templates in its build environment). Rather than running a CI pipeline, the Godot web export is **built locally and committed to git**, then served statically by Vercel. This is the simplest, most reliable option and requires **zero secrets**.

### One-time setup (Vercel dashboard)

Create a second Vercel project pointing at the same GitHub repo:

- Project name: e.g. `ninjaman-godot`
- **Root Directory**: `godot`
- Framework Preset: `Other`
- **Build Command**: leave empty (override → empty)
- **Output Directory**: `build/web`
- Production Branch: `main`

That's it. On every push, Vercel serves the committed `godot/build/web/` as static files. `godot/vercel.json` (`buildCommand: null`, `outputDirectory: build/web`) supplies the WASM content-type + cache headers.

### Updating the Godot build

Whenever you change Godot code/assets, re-export and commit:

1. **Export from the Godot Editor** (most reliable on Windows):
   - Open `godot/project.godot` in Godot 4.6.3
   - Project → Export → Web → export to `godot/build/web/index.html`
2. **Or via CLI** (may hang at 98% on Windows; Linux is reliable):
   ```bash
   GODOT_BIN=/path/to/godot npm run build:godot:web
   ```
3. **Commit the runtime files**:
   ```bash
   git add godot/build/web
   git commit -m "Update Godot web build"
   git push
   ```

> `.gitignore` is configured so that `godot/build/web/` runtime files are tracked, but editor sidecars (`*.import`) and `.vercel/` are excluded. The build is ~43MB (wasm + pck); this is the trade-off for zero-CI hosting.

---

## Verification checklist

After both deployments finish:

- [ ] Phaser URL loads main menu and gameplay (keyboard + gamepad)
- [ ] Godot URL shows Godot loading screen → main menu → playable
- [ ] `npm run typecheck && npm test && npm run build` pass locally

---

## Switching the default Vercel project

The repo root `vercel.json` is the **Phaser** config. The Godot config lives at `godot/vercel.json` and is only read by the Godot Vercel project (Root = `godot`). The two never interfere — do not copy one over the other.
