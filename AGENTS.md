# CarbTune Pro Development Rules

These instructions apply to the entire repository.

## Preserve Existing Behavior

- Do not remove, disable, or substantially change a working feature unless the user explicitly requests it.
- Prefer focused, backward-compatible changes over broad rewrites.
- Preserve the existing single-page, dependency-free architecture unless an architectural change is explicitly requested.
- Preserve the duplicate-safe job system, including duplicate detection, merge handling, job identity, and safeguards against accidental duplicate records.
- Preserve the existing **Delete Job** behavior, including its confirmation and active/history job handling. Do not weaken its safeguards.

## Data and Domain Model

- Preserve compatibility with existing `localStorage` job data wherever reasonably possible.
- When changing stored data, normalize or migrate older records safely. Use defaults for new fields and avoid making existing saved jobs unreadable.
- Keep vehicle chassis identity independent from the installed engine identity. Engine-swap vehicles must retain both the chassis/application data and the installed engine/family data without one overwriting the other.
- Keep manufacturer-verified specifications clearly separate from CarbTune-generated tuning inference, recommendations, or interpretation.
- Prefer verified manufacturer or component data when available. Retain source attribution and verification metadata, and label manual or inferred data honestly.

## Validation and Git Workflow

- Validate all JavaScript before every push. At minimum, perform a syntax check on the JavaScript embedded in `index.html`; also exercise affected behavior when practical.
- Validate the complete change before committing or pushing. Review the diff and confirm that unrelated features and saved-job compatibility remain intact.
- Commit and push only after validation succeeds.
- Do not push a knowingly broken or partially validated change to `main`.
- If validation cannot be completed, report the blocker instead of committing or pushing.
