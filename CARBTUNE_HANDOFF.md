Task: CT-0058
Status: READY_FOR_CHATGPT_REVIEW

# CarbTune Handoff — Repository-scoped unattended Codex permissions

## Result

Normal CarbTune file development, scripts, tests, builds, and validation can run
unattended inside the trusted repository. Normal Git writes use a narrowly
validated protected wrapper because installed native-Windows Codex does not
honor `.git` write overrides and its automatic reviewer reproduced the hidden
approval stall CT-0058 was assigned to fix.

- Starting SHA: `aa95367e14a58a7193e143706f7767182c201208`
- Implementation SHA: `b8618ea4f4f41f30c7e239d321051816eb087a61`
- Deployment: not applicable; no application/runtime files changed.

## Permission model

Trusted project-local `.codex/config.toml` selects `workspace-write`, disables
approval prompts, and enables a proxy-restricted command network allowlist for
GitHub, npm, and loopback. Out-of-policy operations fail immediately rather
than leaving Remote state at `Awaiting approval` while chat shows `Thinking`.

Codex protects `.git`, `.codex`, and `.agents` under writable roots. A
project-local execpolicy allows only
`node .codex/tools/carbtune-git.cjs <operation>` outside the sandbox. The
protected wrapper validates its own repository root and exact
`https://github.com/CuttyGary/carbtune-pro.git` origin. It exposes only status,
diff, bounded log, repository-relative add, one-line commit, origin fetch,
origin/main fast-forward pull, and main-to-origin/main push.

## What remains blocked or manually authorized

- Out-of-repository writes and unrelated repositories.
- Privilege escalation, machine-wide configuration, broad grants, and bypasses.
- Unrelated network/system administration or credential/security changes.
- Force-push, reset/rewrite, deletes, arbitrary remotes/branches/options.
- Changes to protected `.codex` policy/hook files.
- Explicit broader launch flags remain user-controlled overrides outside this model.

## Installed-platform limitation

Official OpenAI documentation supports project-local config, permission
profiles, execpolicy rules, `workspace-write`, network policies, and
non-interactive approvals. Installed Codex `0.151.0-alpha.7.2` on native Windows
still denied `.git/index.lock` with relative and exact absolute profile grants.
Automatic review loaded but two controlled nested probes stalled before spawning
a shell child. Those approaches were rejected rather than broadening access.

## Validation

- Strict doctor: config load PASS; approval `Never`; restricted filesystem and
  enabled network sandbox; provisioning complete. Overall nonzero only for
  non-interactive `TERM=dumb`.
- Execpolicy: wrapper prefix `allow`; direct `git add` unmatched.
- Wrapper: status/log/staging/implementation commit PASS; path escape and
  `push --force` blocked.
- Hook validation: PASS, 28 assertions.
- `npm run validate`: PASS, all 5 programs and 152 workflow assertions.
- Diff checks: PASS; `index.html` unchanged.

## Files changed

- `.codex/config.toml`
- `.codex/rules/carbtune-git.rules`
- `.codex/tools/carbtune-git.cjs`
- `docs/codex-permissions.md`
- `tasks/current.json`
- `tasks/completed/CT-0058.json`
- `CARBTUNE_HANDOFF.md`

## Recommended next step

ChatGPT should review CT-0058. Future assignments should use the documented
wrapper for Git writes and direct Git for reads. Do not broaden this policy
unless a future assignment explicitly requires it.
