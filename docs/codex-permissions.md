# CarbTune Codex permission boundary

CarbTune uses trusted project-local Codex configuration in
`.codex/config.toml`. Normal commands run with `workspace-write`; `.codex`,
`.agents`, `.git`, unrelated paths, and unrelated repositories retain Codex's
protected-path and sandbox boundaries.

The unattended boundary covers ordinary, non-destructive work required by an
active CarbTune assignment: repository reads and edits, repository-local file
and directory creation, tests/build/lint/format/typecheck/package scripts, and
normal Git status/diff/log/add/commit/fetch/fast-forward-pull/push workflow for
the configured CarbTune remote and expected assignment branch.

Command network access is proxy-restricted to GitHub, the npm registry, and
loopback destinations needed by repository workflows. Approval prompts are
disabled so out-of-policy operations fail immediately instead of leaving an
unattended task waiting for a hidden approval. This policy does not use
`danger-full-access`, approval/sandbox bypass, or hook-trust bypass.

Native Windows Codex `0.151.0-alpha.7.2` keeps `.git` read-only even when a beta
permission profile explicitly grants the exact metadata directory. Automatic
approval review also reproduced the unattended `Thinking` stall during a
controlled Git probe. Therefore normal Git writes use the protected
`.codex/tools/carbtune-git.cjs` wrapper:

```powershell
node .codex/tools/carbtune-git.cjs status
node .codex/tools/carbtune-git.cjs diff --cached
node .codex/tools/carbtune-git.cjs add path/to/file
node .codex/tools/carbtune-git.cjs commit "message"
node .codex/tools/carbtune-git.cjs fetch
node .codex/tools/carbtune-git.cjs pull
node .codex/tools/carbtune-git.cjs push
```

A project-local execpolicy rule allows only that exact Node command prefix to
run outside the sandbox. The protected wrapper rejects an unexpected repository
root or origin, paths outside the checkout, extra options, non-fast-forward
pull configuration, non-`main` pushes, force flags, resets, rewrites, deletes,
and every operation not listed above. Direct read-only Git commands can still
run in the sandbox; direct Git metadata writes fail without prompting.

Out-of-repository writes, unrelated repositories, privilege escalation,
machine-wide configuration, and unrelated network destinations remain outside
the policy and fail without running. Repository rules still require explicit
authorization for destructive Git history operations, unrelated credential or
security changes, deletion, and material expansion beyond the active task.

Codex project configuration is not an administrator-enforced boundary. A user
can still explicitly launch Codex with broader flags or add writable roots, and
centrally managed requirements can override or constrain the project layer.
For the intended boundary, launch CarbTune from its saved trusted repository
root without `--add-dir`, `danger-full-access`, or bypass flags.

The current policy syntax was verified against installed Codex
`0.151.0-alpha.7.2` and the official OpenAI configuration reference. The
project-local layer loads only for a trusted repository. Existing lifecycle
hook trust remains hash-bound and unchanged.
