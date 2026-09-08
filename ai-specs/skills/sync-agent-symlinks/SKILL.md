---
name: sync-agent-symlinks
description: Analyze and synchronize agent and skill exposure after changes in ai-specs (additions, removals, renames, edits). Use when agents or skills were added, removed or edited in ai-specs and .claude (and .cursor) must be realigned — via symlinks when the install uses symlinks, or by re-copying when the install uses copies (Windows without Developer Mode).
author: Nubolabs (based on LIDR.co)
version: 1.1.0
---

# sync-agent-symlinks Skill

Keep `.claude/agents`, `.claude/skills` (and `.cursor/agents`, `.cursor/skills` when present) aligned with the canonical source `ai-specs/agents` and `ai-specs/skills`.

Use it after any change in `ai-specs/` — new, removed, renamed **or edited** agent/skill — and whenever `/bootstrap-project` rewrote the agents.

## Step 0 — Detect the exposure mode

Read `ai-specs/.specboot.json`:

- `linkMode: symlink` → **link mode** (entries in mirrors are symlinks to `../../ai-specs/...`).
- `linkMode: copy` or `mixed` → **copy mode** (entries are real files/directories copied from `ai-specs/`).
- File missing → inspect the mirrors: if the entries are symlinks, link mode; otherwise copy mode. Say which one you detected.

`tools` in the manifest tells which mirrors exist (`claude` → `.claude`, `cursor` → `.cursor`). Only manage mirrors that exist.

## Step 1 — Build inventories

1. Canonical agents: `ai-specs/agents/*.md`.
2. Canonical skills: directories in `ai-specs/skills/` that contain `SKILL.md`.
3. Mirror entries per tool in `agents/` and `skills/`.

Classify each mirror entry:

- `managed`: same name as a canonical entry (symlink in link mode; copy in copy mode).
- `broken`: symlink whose target is missing (link mode).
- `stale`: copy whose content differs from the canonical one (copy mode; compare with `diff -rq`).
- `orphan`: managed entry whose canonical source no longer exists.
- `external`: entry with no canonical counterpart that is not managed by specboot (for example OpenSpec's `openspec-*` skills or `commands/`). **Never touch these.**
- `conflict` (link mode only): a real file/directory with the same name as a canonical entry.

## Step 2 — Plan

Per mirror:

- `to_add`: canonical entries missing in the mirror.
- `to_fix`: broken symlinks (link mode) or stale copies (copy mode).
- `to_remove`: orphans.
- `to_skip`: conflicts and externals (report only).

Show the plan before applying it.

## Step 3 — Apply safely

Link mode:

```bash
ln -s ../../ai-specs/agents/<agent>.md .claude/agents/<agent>.md
ln -s ../../ai-specs/skills/<skill>   .claude/skills/<skill>
rm .claude/skills/<orphan>            # only symlinks into the canonical namespace
```

Copy mode (Windows / Git Bash or PowerShell):

```bash
cp    ai-specs/agents/<agent>.md .claude/agents/<agent>.md            # add or overwrite stale copy
rm -rf .claude/skills/<skill> && cp -r ai-specs/skills/<skill> .claude/skills/<skill>
rm -rf .claude/skills/<orphan>                                         # only managed copies
```

In copy mode, overwriting a **managed** copy is expected (that is the sync). Never overwrite or delete an `external` entry, and never edit inside `.claude/` directly — edit `ai-specs/` and re-sync.

## Step 4 — Verify

- Every canonical agent/skill exists in each mirror as a valid symlink (link mode) or an identical copy (`diff -rq` clean, copy mode).
- No broken symlinks, no stale copies, no orphans remain.
- Externals untouched.

## Step 5 — Report

- Mode detected, mirrors managed.
- Per mirror: added, fixed, removed, conflicts, externals skipped.
- Remaining blockers, if any.

## Red flags

Never: treat `.claude/` as canonical; delete externals; leave stale copies after an edit in `ai-specs/`; skip conflicts silently.

Always: detect the mode first; show the plan; apply minimal changes; report.
