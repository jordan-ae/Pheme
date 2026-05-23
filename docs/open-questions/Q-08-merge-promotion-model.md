# Open Question: Replace human-gated merge promotion with promote-by-default

- **Proposed ID:** Q-08 _(confirm against the SRS — Q-03..Q-07 are already allocated; this may instead fold into the existing "PR review surface" question)_
- **Status:** Open — awaiting tech-lead sign-off
- **Raised by:** jordan-ae
- **Date:** 2026-05-20
- **Challenges:** [AD-09](../../packages/memory-server/src/seed.ts) — "Branch-merge promotion is human-gated"
- **Type:** `question` (per the memory schema's `entry_type` enum)

## Problem

AD-09 makes branch-merge promotion a **blocking, manual** step: when a feature
branch merges to main, every feature-scoped entry is queued for tech-lead review,
and a human must mark each one `global` / `archive` / `discard` before it reaches
global memory.

The concern: a blocking human queue backlogs. Entries pile up unreviewed, the
queue becomes maintenance overhead, and in practice either the lead rubber-stamps
it (so the gate adds no value) or it stalls (so branch knowledge never reaches
global memory). The cost is borne every merge; the benefit is occasional.

## What AD-09 was actually protecting

AD-09's stated rationale is narrow: *prevent agent-generated decisions from
silently polluting global memory.* The backlog is an artifact of making the
control **blocking and manual**, not of the goal itself. We can keep the
anti-pollution protection while removing the human bottleneck.

## Proposed change: promote-by-default, auto-archive the noise

On merge of a feature branch, the server promotes branch knowledge automatically,
with no human in the loop:

| Entry on the merging branch                     | Action on promotion        |
| ----------------------------------------------- | -------------------------- |
| `scope = feature`, `status = active`            | → `scope = global`, `branch = global` |
| `status = pending_review` (scribe low-confidence)| → `status = archived` (not promoted) |
| `scope = spike`                                 | → `status = archived` _(sub-decision below)_ |
| `status = superseded` / already `global`        | untouched                  |

Key properties:

- **No review queue.** Nothing blocks the merge. High-signal entries (the scribe's
  `active` writes) flow straight to global.
- **Noise never reaches global.** The scribe already flags low-confidence
  extractions as `pending_review`; those auto-archive instead of promoting. They
  stay queryable for history (AD-10) but are excluded from active context bundles
  ([context.ts:43](../../packages/memory-server/src/routes/context.ts#L43) only
  returns `status = active`).
- **Mistakes are correctable after the fact, not gated before it.** A bad
  promotion is reversed with the existing supersede flow
  ([supersede.ts](../../packages/memory-server/src/routes/supersede.ts)) or by
  archiving. Nothing is ever hard-deleted (AD-10), so this is safe.

## Rationale

- Removes the standing maintenance burden AD-09 created.
- Preserves the one thing AD-09 cared about — keeping unvetted noise out of global
  active context — by leaning on the scribe's existing confidence signal rather
  than a human gate.
- Aligns the cost model: review effort is spent only when someone *chooses* to
  correct a specific entry, not on every entry at every merge.

## Trade-offs / risks

- **Trust shifts to the scribe's `pending_review` classifier.** If the scribe
  marks too little as low-confidence, mediocre `active` entries promote to global.
  Mitigation: this is tunable in the scribe, and supersede/archive cleans up after.
- **No pre-merge veto.** A lead can no longer stop a specific entry before it goes
  global; they can only correct it afterward. For a team-scale text log where
  AD-10 guarantees recoverability, post-hoc correction is judged acceptable.
- **Reverses AD-09's "intentional governance checkpoint."** This is a deliberate
  removal of that checkpoint, not an oversight — it should be recorded as a
  superseding decision, not a silent edit.

## Out of scope / unchanged

- **Constraints** still always-included regardless of branch (AD-12) — promotion
  doesn't touch them.
- **Read-side scope chain** (`global + branch`) is unchanged
  ([context.ts:56](../../packages/memory-server/src/routes/context.ts#L56)).
- **Soft-delete-only** (AD-10) and **supersession** semantics are unchanged and
  are what make post-hoc correction safe.

## Sub-decisions for the reviewer

1. **Spike scope** — archive on merge (proposed), or leave untouched on the branch?
2. **Trigger mechanism** — promotion needs something to call it on merge. Options:
   a new `POST /branches/:branch/promote` endpoint invoked by a git hook / CI step,
   or the (Phase 2) memory-cli. No endpoint exists today; this is net-new surface.
3. **Idempotency** — re-running promote on an already-merged branch is a no-op
   (promoted entries now have `branch = global` and won't re-match). Confirm that's
   the desired contract.

## Decision required

Sign off (or amend) the promote-by-default model above. On approval, the agreed
outcome gets logged as a `decision` that **supersedes AD-09** (per AD-09's own
promotion gating), and only then do we build the trigger + promotion logic.

- [ ] Approved as written
- [ ] Approved with amendments (note below)
- [ ] Rejected — keep AD-09

**Reviewer notes:**
