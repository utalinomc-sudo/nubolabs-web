---
name: bootstrap-project
description: Use when docs/project-profile.md has status TEMPLATE (fresh nubolabs-specboot install), when the user runs /bootstrap-project (optionally with a source document path or --update), or when standards, agents and openspec/config.yaml must be re-synchronized after the project profile changed. Inspects the repo, interviews the user only for what cannot be inferred, fills the profile, rewrites docs/*-standards.md (marking N/A layers), adjusts agent descriptions and openspec/config.yaml, and verifies nothing is left as a placeholder.
author: Nubolabs
version: 0.1.0
---

# bootstrap-project Skill

Turn the generic nubolabs-specboot template into the real context of **this** project. `docs/project-profile.md` is the single source of project facts; everything else in `docs/`, `ai-specs/agents/` and `openspec/config.yaml` is derived from it.

Announce at start: "Voy a adaptar la plantilla specboot a este proyecto con la skill bootstrap-project."

## Arguments

`$ARGUMENTS` may contain, in any order:

- A path to a source document (PDF, Markdown, text, HTML) describing the project — a proposal, architecture doc, meeting notes. Read it first and extract answers from it so the interview is shorter.
- `--update` — the profile is already `FILLED`; re-derive standards, agents and config from the current profile (the user edited it by hand or the stack changed).
- `--yes` / "usa los defaults" — skip the interview and fill unknowns with sensible defaults or `TBD`.

## Modes

| Profile status | Arguments | Mode |
|---|---|---|
| `TEMPLATE` | any | **initial** — full inspection + interview + generation |
| `FILLED` | `--update` | **update** — re-generate derived files from the profile; keep manual edits marked `<!-- keep -->` |
| `FILLED` | none | ask the user: update, or stop because it is already bootstrapped |

## Step 1 — Inspect the repository (before asking anything)

Read, when present, and build an **inferred facts** table with a confidence level (high / medium / low):

- Manifest and lockfiles: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `pyproject.toml`, `requirements.txt`, `go.mod`, etc. → language, framework, package manager, scripts, test runner, lint.
- Framework configs: `next.config.*`, `vite.config.*`, `nuxt.config.*`, `angular.json`, `tailwind.config.*`, `postcss.config.*`, `tsconfig.json`, `.eslintrc*`, `prettier*`.
- Environment example: `.env.example`, `.env.local.example` → integrations and credential variable names (never values).
- Existing docs: `README.md`, `docs/*.md`, `docs/*.pdf` (read PDFs with the Read tool) → product description, domain, hosting, conventions.
- Source tree: `app/`, `src/`, `pages/`, `components/`, `lib/`, `api/`, `types/`, `server/` (2 levels deep) → layers, routes/endpoints, entities.
- Persistence and auth code: search for ORM clients, SDK inits (Firebase, Prisma, Supabase, Mongo, SQL), auth helpers.
- Tests: `*.test.*`, `*.spec.*`, `vitest.config.*`, `jest.config.*`, `playwright.config.*`, `cypress/`.
- CI/CD: `.github/workflows/`, `vercel.json`, `netlify.toml`, `Dockerfile`, `fly.toml`.
- Git: `git remote -v`, `git branch --show-current`, `git log --oneline -20` → repo URL, main branch, **commit language and convention** (infer from real messages), branching habit.

Also detect the exposure mode from `ai-specs/.specboot.json` (`linkMode`) — needed in Step 6.

## Step 2 — Read the source document (if given)

Extract: project name and type, one-liner, owner, hosting, integrations, domain glossary, sensitive data, non-functional constraints. Mark each extracted value with its source ("del documento X, sección Y").

## Step 3 — Interview (only for what is still unknown)

Rules:

- Ask in the **conversation language** (default Spanish). Short questions, grouped by topic, **maximum 4 rounds**. Use the AskUserQuestion tool when available; otherwise ask in chat.
- **Never ask what you already inferred with high confidence.** Show inferred values as a proposal to confirm in round 1, all at once.
- The user may answer "usa los defaults" or "no sé todavía" at any point → apply defaults or record `TBD`. Never invent.
- If the session is non-interactive or the user is not reachable, skip the interview: use inferred values, apply defaults, record everything uncertain in §11 TBD, and say so in the final summary.

Rounds (skip any round with nothing to ask):

1. **Identidad y stack:** name, type, one-liner, owner, prod URL + confirmation of the inferred stack table.
2. **Capas y datos:** own backend? database? auth? external integrations and their credential variables?
3. **Calidad y entrega:** test runner, E2E tool, lint/typecheck commands, hosting and deploy flow, branching, commit convention, PR policy.
4. **Contexto:** domain glossary (5–10 terms), sensitive/personal data handled, languages per artifact (code, comments, UI, docs, specs, commits, chat), planning and implementation models.

Defaults when the user asks for them: languages = code EN / comments, UI, docs, specs, commits, chat ES; branching = `feature/<change>`; commits = descriptive, imperative, optional area prefix; PRs = optional, main branch protected only if there is a team; planning model = most capable available (Claude Code: Opus high / Fable); implementation = default session model; coverage = not enforced when there is no runner.

## Step 4 — Write `docs/project-profile.md`

- Replace every `{{PLACEHOLDER}}` with the real value, `N/A` (does not apply) or `TBD` (unknown).
- Set frontmatter `status: FILLED` and `last_bootstrap: <today ISO date>`.
- §3 active layers: `Sí` / `No` per layer, derived from facts (a Next.js app with `app/api` routes **has** a backend; an app calling Resend or n8n **has** integrations).
- §5 verification commands: the real scripts that exist (for example `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`). Run them once now to confirm they work; if one fails, keep it but note the failure in §11.
- §11 TBD table: every unknown, why, and how to resolve it.
- §12: a short real tree of the repo (2 levels).

## Step 5 — Rewrite the derived docs

For each document, rewrite it **in the docs language of the profile §6**, with real paths, real patterns quoted from the code, and no placeholders left:

| Document | If the layer applies | If it does not apply |
|---|---|---|
| `docs/base-standards.md` | Fill languages, links, planning models, verification commands, security notes | — (always applies) |
| `docs/frontend-standards.md` | Stack, structure, naming, component rules, state/data, styling tokens, a11y/i18n, patterns with file examples, anti-patterns, verification | Replace the body with: `N/A — este proyecto no tiene frontend. Si cambia, corre /bootstrap-project --update.` (keep the frontmatter) |
| `docs/backend-standards.md` | Runtime, structure, endpoint conventions, validation, error shape, persistence, auth, logging, patterns, anti-patterns, verification | Same N/A stub |
| `docs/integration-standards.md` | Inventory table from profile §4, rules, patterns per type with the project's real degradation example, how to add a new one | Same N/A stub |
| `docs/api-spec.yml` | Real endpoints with methods, auth, request/response schemas, error shape | `# N/A — este proyecto no expone API propia...` |
| `docs/data-model.md` | Real entities from types/schemas/collections, fields, where defined, relations, rules | Same N/A stub |
| `docs/documentation-standards.md` | Languages and the docs map with the project's real documents (add rows for existing docs such as a status doc) | — |
| `docs/openspec-tasks-mandatory-steps.md` | Verification commands; keep steps N+2 (curl) and N+3 (E2E) only if their layer applies | — |

Do not touch documents that were already in `docs/` before specboot (the installer never overwrote them); reference them from the docs map instead.

## Step 6 — Adjust the agents and expose them

In `ai-specs/agents/*.md`:

- Replace `{{*_AGENT_STACK_NOTE}}` in each `description` with one sentence naming the real stack of that layer (e.g. "Stack: Next.js 14 Route Handlers + Firebase Admin/Firestore"). If the layer does not apply: "This project has no <layer>; only use when that changes."
- Replace `{{*_PROJECT_NOTES}}` with 5–15 bullet points of what an implementer must know: key paths, helpers to reuse, error shape, auth helper, conventions, gotchas found in the code.
- Keep `name`, `tools`, `model`, `color` unchanged.

Then expose them according to `ai-specs/.specboot.json` → `linkMode`:

- `symlink`: nothing to do.
- `copy` or `mixed`: run the `sync-agent-symlinks` skill (copy mode) so `.claude/agents/*` (and `.cursor/agents/*` if present) match `ai-specs/agents/*`.

## Step 7 — Write `openspec/config.yaml`

Keep the `schema:` line and any language block OpenSpec generated. Then set:

```yaml
context: |
  <project one-liner>. Stack: <from profile §2>. Domain: <from §8, 1 line>.
  Languages: code <..>, UI <..>, docs <..>, specs <..>, commits <..>.
  Single source of truth: docs/project-profile.md (status FILLED). Read docs/base-standards.md before any artifact.
  Layer docs: docs/frontend-standards.md (<applies/N/A>), docs/backend-standards.md (<..>), docs/integration-standards.md (<..>),
  docs/api-spec.yml (<..>), docs/data-model.md (<..>), docs/documentation-standards.md, docs/openspec-tasks-mandatory-steps.md.
  Planning: adopt ai-specs/agents/<layer>-developer.md for the matching layer. Skills in ai-specs/skills/ guide the workflow.
  Verification commands (agent must run): <profile §5>.

rules:
  _global:
    - Read docs/base-standards.md and docs/project-profile.md before creating any artifact.
    - For frontend artifacts read docs/frontend-standards.md; for backend docs/backend-standards.md; for integrations docs/integration-standards.md.
    - Keep docs/api-spec.yml and docs/data-model.md consistent with specs and tasks.
  proposal:
    - Include a "Non-goals" section and the acceptance criteria as scenarios.
  tasks:
    - Follow docs/openspec-tasks-mandatory-steps.md (step 0 branch; final mandatory steps; agent executes tests).

operations:
  apply:
    guidance:
      - Run the verification commands from docs/project-profile.md §5 before marking a task done.
  archive:
    guidance:
      - Update the docs listed in docs/documentation-standards.md §3 before archiving.
```

## Step 8 — Verify and report

1. `grep -rn "{{" docs/ ai-specs/ openspec/config.yaml CLAUDE.md` must return nothing (except inside this skill's own file). Fix anything left.
2. Check the root pointers exist (`CLAUDE.md`, `AGENTS.md`, `codex.md`, `GEMINI.md`) and point to `docs/base-standards.md` (symlink or `@docs/base-standards.md` stub).
3. Check every agent and skill in `ai-specs/` is exposed in `.claude/` (and `.cursor/` if installed) — valid symlink or up-to-date copy.
4. Run the verification commands of the profile §5 once more if any doc changed them.
5. Print a summary table: files written, layers applied vs N/A, exposure mode, and the §11 TBD list with how to resolve each item.

End with: "Perfil en `docs/project-profile.md` (status FILLED). Revísalo; si cambias algo estructural corre `/bootstrap-project --update`."

## Guardrails

- Do not modify application code, dependencies or environment files.
- Do not overwrite documents that pre-existed in `docs/`; reference them.
- Never write credential values anywhere; only variable names.
- Never invent facts about the project; use `TBD` and list it in §11.
- Keep OpenSpec's structural headings and SHALL/MUST keywords in English inside specs, whatever the specs language is.
