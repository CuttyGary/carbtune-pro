# CT-0057 — Automatic Codex Pickup Test

Status: READY_FOR_CODEX
Owner: ChatGPT
Priority: TEST

## Purpose

Verify that the trusted repository-local SessionStart hook can surface a new ChatGPT assignment without the user manually typing a task-discovery instruction.

## Codex instruction

When this assignment is surfaced automatically by the SessionStart hook:

1. Do not modify CarbTune application code.
2. Change this task's status to `CODEX_WORKING` and record the starting HEAD SHA and UTC timestamp.
3. Then change the status to `READY_FOR_CHATGPT_REVIEW` and append a short `## Codex Response` confirming:
   - this task was surfaced by the SessionStart hook;
   - whether the user had to type a GitHub/task-discovery instruction;
   - branch and starting HEAD SHA;
   - no application code was changed.
4. Commit and push only this task/reporting change with commit message `test: confirm automatic Codex pickup`.
5. Stop for ChatGPT review.

This is a communication test only. Do not begin other CarbTune work.
