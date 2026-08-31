# CarbTune Development Environment

## Verified dedicated Windows baseline

CarbTune currently works on the dedicated Windows development machine at `C:\CarbTune\carbtune-pro`. The verified baseline is:

- Node.js 24 LTS family, installed from the official Node.js Windows package through Windows Package Manager (`OpenJS.NodeJS.LTS`).
- npm and npx supplied with Node.js.
- Git for Windows with Git Credential Manager.
- Playwright from this repository's pinned development dependency.
- Playwright Chromium plus its browser dependencies.
- GitHub authentication through Git Credential Manager for the `CuttyGary` account.

Versions may receive compatible maintenance updates. The repository and CI intentionally target the Node 24 LTS family rather than a specific workstation patch release.

## First-time setup

Install Node.js 24 LTS and Git for Windows from their official distributions. In PowerShell, open a new shell after installation, then run:

```powershell
cd C:\CarbTune\carbtune-pro
npm install
npx playwright install chromium
npm run validate
```

GitHub Actions uses `npx playwright install --with-deps chromium` because its Linux runner also needs operating-system browser libraries. On Windows, the Playwright browser bundle is installed in the normal per-user cache. The validation runner can also use installed Google Chrome when available.

## GitHub authentication

The repository remote must be `https://github.com/CuttyGary/carbtune-pro.git`. Git Credential Manager owns authentication; no token, password, cookie, or credential file belongs in this repository.

Verify without exposing secrets:

```powershell
git remote -v
git credential-manager github list
git fetch origin
git rev-list --left-right --count main...origin/main
```

The expected account label is `CuttyGary`, a successful fetch exits zero, and a synchronized branch reports `0 0`. If authentication expires, use Git Credential Manager's GitHub sign-in flow and approve only the official GitHub browser prompt.

## Daily validation

The one supported complete command is:

```powershell
npm run validate
```

Exit code `0` means every configured stage genuinely passed. Any nonzero code is a failure that must be diagnosed rather than hidden. The suite reports the failing program and covers JavaScript integrity, vehicle registry invariants, project controls, relational vehicle cascades, browser workflow, persistence/backward compatibility, provenance boundaries, and responsive smoke tests.

For a read-only status summary, run `npm run project:status`. Use `npm run project:status -- --validate` only when the report should include a newly executed validation result.

## Security and data handling

- Never commit `.env` files, tokens, passwords, cookies, customer records, VINs, or shop-sensitive production data.
- Do not expose the local development server to the public internet.
- Keep source licensing and provenance constraints with imported knowledge.
- Preserve a clean working tree and review every diff before commit and push.
