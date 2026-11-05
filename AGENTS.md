# AGENTS.md — MockLoop

<!--
  WHY THIS FILE EXISTS
  This is the rules file every AI coding agent (Antigravity, Claude Code, Cursor, Copilot) reads
  before touching the repo. It bridges the PRD and mockups (made in Claude Web, Weeks 3–5) and
  day-to-day implementation in the IDE (Weeks 6+).
  Keep it short enough to read in one pass. When the AI keeps making the same mistake, add a rule here
  and record the change in the "Changelog" section at the bottom.
  Claude Code only auto-loads CLAUDE.md, so the repo root also has a one-line CLAUDE.md containing
  `@AGENTS.md` (added in v2 after the HW3 test showed the rules were otherwise not loaded).
-->
<!-- v2 = rule added or changed after the HW3 before/after test -->


## 0. TL;DR for agents

1. Before writing code, read the GitHub Issue, the matching user story in `docs/PRD.md`, and the mockup in `docs/mockups/`.
2. Put code where Section 2 says it goes. Do not create new top-level folders.
3. Every pure function gets a unit test. Every feature gets at least one React Testing Library test.
4. Handle **empty and error** states on every screen, and a **loading** state for anything asynchronous (AI calls). <!-- v2 -->
   localStorage reads are synchronous: load them in the `useState` initializer, with no loading flash.
5. Never invent feedback in AI output, and never ship the API key to the browser.
6. Use the branch name `feature/<issue#>-short-desc` and the commit format `feat(scope): message (#<issue#>)`.
7. Change only what the issue needs. Do not reformat or touch unrelated files. <!-- v2 -->
8. Finish with a short report: files changed, tests run, assumptions, and what you could **not** verify. <!-- v2 -->

---

## 1. Project context

MockLoop helps students remember mock-interview feedback. Users paste messy notes, the AI turns them
into **improvement points**, the app merges repeated feedback, and the home screen shows open points
right before the next mock. The full problem and evidence are in `docs/PRD.md`.

### Tech stack (pinned versions; do not upgrade without an issue)

| Layer | Choice | Version |
|---|---|---|
| Language | TypeScript (strict mode) | 5.6 |
| UI | React (function components + hooks) | 18.3 |
| Build | Vite | 5.4 |
| Styling | Tailwind CSS | 3.4 |
| Validation | zod | 3.23 |
| Unit / component tests | Vitest + React Testing Library + jsdom | 2.1 / 16 |
| Lint / format | ESLint (flat config) + Prettier | 9 / 3 |
| AI proxy | Node 20 + Express | 4.21 |
| AI SDK | `@anthropic-ai/sdk`, model from env `ANTHROPIC_MODEL` (default `claude-haiku-5-5`) | latest 0.x |
| Storage | `localStorage`, key `mockloop.v1` | — |

<!-- Why a proxy: in P1 the artifact sandbox called Claude for us. A real web app must not expose the key, so all AI calls go through server/. -->

### Architecture

```
mockloop/
├── AGENTS.md              ← this file
├── docs/
│   ├── PRD.md             ← user stories US-1…US-8 + acceptance criteria
│   └── mockups/           ← screenshots of the P1 prototype (01-home.png …)
├── server/                ← AI proxy, the ONLY place that knows ANTHROPIC_API_KEY
│   ├── index.ts           ← Express app, mounts routes under /api
│   ├── routes/organize.ts     ← POST /api/organize   (US-1)
│   ├── routes/repeatCheck.ts  ← POST /api/repeat-check (US-4)
│   └── prompts/           ← prompt text as .ts constants, one file per route
├── src/
│   ├── app/               ← App.tsx, tab navigation, providers
│   ├── components/        ← shared presentational UI (Button, Chip, EmptyState, ConfirmDialog). No data access.
│   ├── features/          ← one folder per screen / user story
│   │   ├── home/          ← "Before my next mock" (US-3)
│   │   ├── log/           ← Log a mock: paste notes + manual form (US-1, US-7)
│   │   ├── points/        ← All points, filters, resolve/reopen (US-2, US-5, US-7)
│   │   ├── repeat-check/  ← match proposals (US-4)
│   │   └── progress/      ← charts and summary (US-6)
│   ├── lib/
│   │   ├── storage.ts     ← the ONLY module that touches localStorage
│   │   ├── dates.ts       ← local-time date helpers (never UTC)
│   │   ├── schemas.ts     ← zod schemas for Session, ImprovementPoint, AI responses
│   │   └── api.ts         ← fetch wrappers for /api/*
│   └── types/models.ts    ← Session, ImprovementPoint, Category, SessionType
└── .github/workflows/ci.yml
```

**Key patterns**
- **Feature folders:** a feature folder holds its components, hooks, pure logic and tests, e.g.
  `features/home/BeforeNextMock.tsx`, `features/home/sortOpenPoints.ts`, `features/home/sortOpenPoints.test.ts`.
- **Logic out of components:** sorting, filtering, matching and stats are pure functions in `*.ts` files, so they are easy to unit test.
- **State:** one `useMockLoopStore()` hook (in `src/app/`) wraps `lib/storage.ts`. Do not add Redux, Zustand or Context per feature.
- **Data flow:** component → hook → `lib/storage.ts` / `lib/api.ts`. Components never call `localStorage` or `fetch` directly.

### Naming conventions

| Thing | Convention | Example |
|---|---|---|
| React component file | PascalCase `.tsx` | `PointRow.tsx` |
| Hook | `useXxx.ts` | `useRepeatCheck.ts` |
| Pure logic / util | camelCase `.ts` | `sortOpenPoints.ts` |
| Test | same name + `.test.ts(x)`, next to the file | `sortOpenPoints.test.ts` |
| Types / interfaces | PascalCase, no `I` prefix | `ImprovementPoint` |
| Constants | UPPER_SNAKE_CASE | `STORAGE_KEY`, `CATEGORIES` |
| Event handlers | `handleXxx`; props `onXxx` | `handleResolve`, `onResolve` |
| Booleans | `is/has/can` prefix | `isLoading`, `hasPlan` |

**Domain words: use exactly these.** Session, Improvement point (`point` in code), Category, "heard N times",
open / resolved, practice plan (`practiceAction` field). Do not invent synonyms such as "issue", "tip" or "feedbackItem".

### Coding standards
- TypeScript `strict: true`; no `any` (use `unknown` + zod to parse).
- Named exports only, no default exports (except `App.tsx`).
- Function components only, no class components.
- Keep files under ~200 lines; split when a component has more than one job.
- Point text is phrased as **what happened** ("Went quiet when stuck"), not advice ("Keep talking"). This was a P1 lesson.

### Testing strategy
- **Framework:** Vitest + React Testing Library (`npm test`), jsdom environment, setup in `src/test/setup.ts`.
- **Pure functions** (`lib/`, `features/*/*.ts`): unit tests covering the happy path, edge cases and empty input.
- **Features:** at least one RTL test per screen that renders it, performs the main user action, and asserts on visible text.
  Query by role or label (`getByRole('button', { name: /resolve/i })`), never by class name or test id unless unavoidable.
- **AI routes:** mock `fetch` or the SDK. Tests never call the real API.
- **Acceptance criteria → tests:** each checkbox in the issue should map to at least one test, and the test name should quote the criterion.
- **Coverage goal:** ≥ 80% for `src/lib` and `features/*/*.ts`, ≥ 60% overall.
- Run `npm run lint && npm test` before saying a task is done.

---

## 2. PRD & design references

- **PRD:** `docs/PRD.md`, with user stories US-1…US-8, acceptance criteria and the data model.
- **Working P1 prototype:** https://claude.ai/artifact/N7sqmuvc35rduBwE2i1urr (the source of truth for look and behaviour)
- **Mockups:** `docs/mockups/01-home.png` … `05-progress.png`

### Design language (from the P1 prototype)
- Mobile first: single column, max content width 640px, **no horizontal page scroll at 375px**.
- Tap targets ≥ 44px tall.
- Neutral background, one accent color for primary actions, category shown as a small colored chip.
- Dates shown as `Sun, Oct 18` (en-US short weekday + month + day).

### Key UI components and expected behaviour

| Component | Where | Behaviour |
|---|---|---|
| `TabBar` | `app/` | Tabs: **Home · Log · All points · Progress**. Home is the default tab. |
| `PointRow` | `components/` | Shows text, category chip, "heard N times" (when N ≥ 2), and the practice plan underneath. Actions: Resolve / Reopen, Edit, Delete. |
| `BeforeNextMock` | `features/home/` | Lists **only open** points, sorted by `sessionIds.length` desc, then `createdAt` desc. Empty state: "No open points. Log your first mock →". |
| `LogForm` | `features/log/` | Two modes: **Paste notes** (textarea + "Organize") and **Log by hand**. Required: date (not in future), type, ≥1 point. Errors show under each field; typed input is kept on a failed submit. |
| `DraftReview` | `features/log/` | AI draft shown as an editable form. Nothing is saved until "Save mock". Empty point rows are ignored on save. |
| `RepeatCheck` | `features/repeat-check/` | For each proposed match: new point, existing point, reason, buttons **Same, link** / **Different**. |
| `CategoryChips` | `features/points/` | Chips with counts; hidden when the count is 0; horizontally scrollable row. |
| `ConfirmDialog` + Undo toast | `components/` | Used for every delete. |

### User flows the AI must follow

1. **Log by pasting (US-1 → US-4):**
   Log tab → paste notes → **Organize** → loading state → `DraftReview` (editable) → **Save mock** →
   if there are existing points, `RepeatCheck` → user confirms or rejects each match → saved → toast → Home.
   On AI failure: show "Couldn't organize notes — fill them in by hand" and switch to the manual form **with the notes kept**.
2. **Before a mock (US-3, US-8):** open the app → Home shows open points, most repeated first, each with its practice plan or a "+ Add a plan" link.
3. **Manage points (US-2, US-5, US-7):** All points → filter by category / status → Resolve, Reopen, Edit or Delete. Deleting a point shared by several sessions shows a warning first.
4. **Track progress (US-6):** Progress tab → bars of open points per category + opened vs. resolved per week + one-line summary.

### AI behaviour rules (server/prompts)
These rules were validated in HW1 (6/6 in 3/3 runs). Do not weaken them.
- Praise ("good", "clean", 👍) is **not** an improvement point.
- Missing information → `null`. **Never invent** points or facts.
- Keep uncertainty markers ("??") as uncertain.
- Resolve relative dates ("thu") using today's local date, which is passed in the request.
- Return JSON only, validated with zod on the server **and** on the client.
- Input may mix Chinese and English; the output text keeps the user's language.

---

## 3. Scrum & workflow

<!-- The GitHub Project board has columns Backlog → Sprint Todo → In Progress → In Review → Done. Milestones: Sprint 1, Sprint 2. -->

### Working on an issue
1. Pick an issue from **Sprint Todo**. Read its acceptance criteria, the PRD story it links to, and the mockup.
2. Before coding, write a short plan: which files you will create or change and which tests you will add.
3. Create a branch, implement, and add tests that map to each acceptance criterion.
4. Run `npm run lint && npm test`, then open a PR.

### Branch naming
`<type>/<issue#>-<kebab-description>`, where type is `feature`, `fix`, `chore` or `docs`.
Examples: `feature/5-before-next-mock`, `fix/16-empty-point-blocks-save`, `chore/1-scaffold-vite`.

### Commit messages ([Conventional Commits](https://www.conventionalcommits.org))
```
<type>(<scope>): <imperative summary> (#<issue#>)

[optional body: why, not what]
```
- type: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`, `style`
- scope: a feature folder or area: `home`, `log`, `points`, `repeat-check`, `progress`, `storage`, `server`, `ci`
- Examples: `feat(home): sort open points by times heard (#5)`, `test(storage): cover corrupted JSON fallback (#3)`
- One logical change per commit. Never commit `.env`.

### Pull requests
- Title: `[#<issue#>] <summary>`, e.g. `[#5] Before my next mock home screen`
- The body must include `Closes #<issue#>`, the issue's acceptance criteria as a checklist (ticked when met), screenshots at 375px for UI changes, and a "How I tested" section.
- CI (lint + test) must pass. At least **1 review** is required before merge (a teammate, or a self-review against the checklist if solo).
- Squash merge; the squash title follows the commit format.

### Referencing issues
- In commits: `(#12)` at the end of the subject line.
- In PRs: `Closes #12` (or `Refs #12` for partial work).
- In code: only for non-obvious decisions, e.g. `// Ignore empty rows so they don't block save (#16)`. Do not put TODOs without an issue number: write `// TODO(#14): …`.

### Definition of Done
All acceptance criteria are checked · tests are added and pass · lint is clean · there is no horizontal scroll at 375px · empty and error states exist (plus loading for async work) · the PR is reviewed and merged · the issue has moved to **Done**.

<!-- v2 -->
- **Visual check:** open the screen at 375px in a browser. If you can't (for example, a headless agent), write "Not visually verified at 375px" in the PR. Don't claim it was checked.
- **Depends on a screen that doesn't exist yet** (e.g. the Log tab, issue #4): keep the callback prop optional, render the text without the link, and leave `// TODO(#<issue>): wire up …` at the call site.
- **Mockup file missing:** say so in the PR and follow the written spec in §2 exactly (texts, sort order, labels). Don't invent new UI copy.

---

## 4. Do's and don'ts

### ✅ Do
- Reuse components from `src/components/` before creating new ones.
- Keep business logic in pure functions and test them.
- Validate everything from `localStorage` and the AI with zod; fall back safely on bad data (do not crash).
- Use `crypto.randomUUID()` for ids.
- Use the helpers in `lib/dates.ts` for every date (local time, `YYYY-MM-DD`).
- Keep the storage key and data format `mockloop.v1` backward compatible; add a migration if the shape changes.
- When something in the issue is ambiguous, state your assumption in the PR description.
- Treat `sessionIds` as a set: never add a duplicate id, and compute "heard N times" from unique ids (`new Set(point.sessionIds).size`). <!-- v2 -->
- Copy UI text exactly as written in §2 and the issue ("heard N times", "No open points. Log your first mock →", "+ Add a plan"). <!-- v2 -->
- Give React Testing Library tests names that quote the acceptance criterion they check. <!-- v2 -->

### ❌ Don't
- Don't call `localStorage` or `fetch` from components.
- Don't use `any`, class components, default exports, or inline `style={{}}` (use Tailwind classes).
- Don't use `new Date().toISOString().slice(0,10)` for "today": that is UTC and gives the wrong day in the evening in US time zones.
- Don't add dependencies without asking in the issue or PR. In particular, **no** chart libraries (use plain div bars), state libraries, UI kits, moment or lodash.
- Don't rename domain terms or change the 5 categories.
- Don't let the AI-generated draft save automatically.
- Don't put an API key, or anything starting with `sk-`, in `src/`, tests or commits.

### Preferred libraries
| Need | Use | Avoid |
|---|---|---|
| Validation | zod | hand-written type guards |
| Class names | `clsx` | template-string spaghetti |
| Dates | native `Intl.DateTimeFormat` + `lib/dates.ts` | moment, dayjs |
| Charts | Tailwind div bars | chart.js, recharts |
| HTTP | native `fetch` | axios |

### Security
- `ANTHROPIC_API_KEY` lives only in `server/.env` (git-ignored). `.env.example` documents the variable names.
- The server limits request size (notes ≤ 10,000 characters) and returns generic error messages (no stack traces).
- Render user text as React text nodes only; never use `dangerouslySetInnerHTML`.
- Notes may contain personal information: do not log request bodies on the server.

### Accessibility
- Every input has a visible `<label>`; error messages are linked with `aria-describedby`.
- Everything works with the keyboard; focus is visible; dialogs trap focus and close on Esc.
- Color is never the only signal (category chips also show text).
- WCAG AA contrast (4.5:1 for text).
- Loading states use `aria-busy` or a live region ("Organizing your notes…").

---

## Changelog
<!-- Record every refinement made after the HW3 before/after test. Graders look for evidence of iteration. -->
- v1 (2026-11-04): initial rules from the PRD, the P1 prototype and P1 lessons learned.
- v2 (2026-11-04): changes after the HW3 before/after test on issue #5 (see docs/before-after-comparison.md):
  - Added `CLAUDE.md` (`@AGENTS.md`): Claude Code does not read AGENTS.md on its own.
  - Loading state only for async work: run B added a loading state for synchronous localStorage, so the screen flashed "Loading…" on every start.
  - `sessionIds` is a set: run A deduplicated ids but run B didn't; the rule makes the safer behaviour the standard.
  - Unbuilt dependencies: run B left an untracked comment ("wired up in their own issues") instead of `TODO(#issue)`.
  - Don't touch unrelated files: run B's Prettier pass reformatted `storage.test.ts` (it reverted it, but only by luck).
  - Missing mockup and visual checks: neither run could open a browser; both had to guess the layout because `docs/mockups/` is empty. Agents must now say what they did not verify.
  - Exact UI copy and AC-named tests: moved from implied to explicit (run A invented its own empty-state text and "Heard once").
