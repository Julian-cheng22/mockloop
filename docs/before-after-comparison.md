# Before/After Test: Same Feature With and Without AGENTS.md

Feature: **issue #5, "Before my next mock" home screen (US-3)**. Three runs on the same starting commit with the same prompt: A (no rules), B (AGENTS.md v1), B2 (AGENTS.md v2, after refining the rules from what A and B showed).

| Run | Branch | Compare |
|---|---|---|
| A: without rules | `test/5-no-rules` | [main…test/5-no-rules](https://github.com/Julian-cheng22/mockloop/compare/main...test/5-no-rules) |
| B: with rules v1 | `test/5-with-rules` | [main…test/5-with-rules](https://github.com/Julian-cheng22/mockloop/compare/main...test/5-with-rules) |
| B2: with rules v2 | `test/5-with-rules-v2` | [main…test/5-with-rules-v2](https://github.com/Julian-cheng22/mockloop/compare/main...test/5-with-rules-v2) |

## 1. Methodology

| Item | Value |
|---|---|
| Starting commit | `3b0fa2b` (main after #1 scaffold and #3 data layer were merged) |
| AI tool | Claude Code (Claude desktop app). Each run was a **brand-new agent session with an empty context**: it had no access to this conversation, earlier runs or other folders, only its own fresh clone of the repo. |
| Model | Same model for every run (Claude Opus 5.5) |
| Repo state | A: `AGENTS.md` deleted (`git rm`, not just renamed, so the agent couldn't open it by accident). B / B2: `AGENTS.md` + a one-line `CLAUDE.md` (`@AGENTS.md`) |
| Environment note | Every session got the same setup sentence: "If the project root contains a CLAUDE.md or AGENTS.md, read it first and follow it", which simulates the IDE auto-loading rules files. In A neither file existed. |
| Prompt A | "Build a home screen for my mock interview app that shows the feedback points I still need to work on, with the most repeated ones first. Include tests." |
| Prompt B / B2 | The same sentence, plus: "This is GitHub issue #5 (US-3 in docs/PRD.md); the mockup is docs/mockups/01-home.png." |
| Rules | The first complete answer was accepted, with no follow-up prompts and no manual fixes before measuring |
| Measurement | `scripts/measure.sh` + reading the code against the 7 acceptance criteria of #5 |

**Limits of this test (stated honestly)**
- One run per condition, so model randomness is not averaged out.
- `docs/PRD.md` is in the repo for all runs. Run A found and read it on its own, so A was not "context-free": it only lacked the rules file and the pointer to the issue.
- `docs/mockups/01-home.png` does not exist yet (issue #9). B and B2 had only the text design spec in AGENTS.md.
- No run could open a browser, so "no horizontal scroll at 375px" is judged from the code, not from a screenshot.
- The ESLint config from #1 already enforces two AGENTS.md rules (no `any`, named exports) for every run, including A.

## 2. Results

### 2.1 Acceptance criteria of #5

| Criterion | A (no rules) | B (rules v1) | B2 (rules v2) |
|---|---|---|---|
| Home shows **only open** points | ✅ | ✅ | ✅ |
| Sorted by sessions desc, then `createdAt` desc | ✅ (counted unique ids) | ✅ (counted raw `length`) | ✅ (counted unique ids) |
| Text + category chip + "heard N times" **only when N ≥ 2** | ❌ shows "Heard once" / "Heard 2 times" for every point | ✅ | ✅ |
| Practice plan, else "+ Add a plan" | ⚠️ plan only; "+ Add a plan" left out on purpose | ✅ (shown once a handler exists) | ✅ (shown once a handler exists) |
| Empty state "No open points. Log your first mock →" linking to Log | ⚠️ own text, no link | ✅ exact text; link once the Log tab exists | ✅ exact text; link marked `TODO(#4)` |
| No horizontal scroll at 375px; tap targets ≥ 44px | ⚠️ wraps text; no buttons to size | ✅ `min-h-11` (44px), `overflow-x-hidden` (code check) | ✅ `min-h-11` (44px) (code check) |
| Unit test for sort + RTL test for list and empty state | ✅ | ✅ | ✅ |
| **Total (✅ = 1, ⚠️ = 0.5)** | **4.5 / 7** | **7 / 7** | **7 / 7** |

### 2.2 Measurable metrics

| Metric | A (no rules) | B (rules v1) | B2 (rules v2) | Source |
|---|---|---|---|---|
| Code files changed (excl. CLAUDE.md) | 6 | 10 | 10 | `git diff --stat` |
| Code lines added | 294 | 461 | 414 | `git diff --stat` |
| File names match AGENTS.md (`BeforeNextMock.tsx`, `sortOpenPoints.ts`) | 0 / 2 (`HomeScreen.tsx`, `openPoints.ts`) | 2 / 2 | 2 / 2 | file list |
| Shared components in `src/components/` (reusable by #6, #11) | 0 (all inline) | 3 (`PointRow`, `CategoryChip`, `EmptyState`) | 2 (`PointRow`, `CategoryChip`) | file list |
| Data access through the store hook (`useMockLoopStore`) | ❌ `App` calls `loadPoints()` directly | ✅ | ✅ (reads storage in the `useState` initializer) | code |
| `localStorage`/`fetch` in components · `any` · default exports · new deps | 0 · 0 · 0 · 0 | 0 · 0 · 0 · 0 | 0 · 0 · 0 · 0 | measure.sh |
| New tests | 15 | 22 | 23 | diff of `it(` |
| Tests named after an acceptance criterion | 0 | 7 | 5 | diff |
| Test queries by role (`getByRole`, `getAllByRole`, `queryByRole`) | 6 | 12 | 6 | diff |
| All tests pass · lint clean · `tsc` clean | ✅ 48/48 | ✅ 55/55 | ✅ 56/56 | `npm test`, `npm run lint` |
| Error state | ❌ | ✅ | ❌ dropped it, reasoning that storage already falls back to empty lists (see §3) | code |
| Loading state | ❌ | ⚠️ yes, but for synchronous localStorage, so it flashes on every start | ✅ none (correct: the data is synchronous) | code |
| Untracked "later" comments (TODO without issue #) | 0 | 1 | 0 (`TODO(#4)` used) | diff |
| Touched unrelated files | 0 | 1 (Prettier reformatted `storage.test.ts`; reverted) | 0 | agent report + diff |
| Said what it could not verify (375px, missing mockup) | partly ("haven't opened it in a browser") | yes | yes (mockup missing, issue not readable, not checked at 375px) | agent report |
| Agent time / tool calls | 73 s / 7 | 123 s / 9 | 104 s / 7 | session stats |

### 2.3 Qualitative differences (with code)

**1. Understanding the design intent: "heard N times".** The PRD only shows the label for repeated feedback, because a point you heard once isn't a pattern yet. A labelled every point:

```tsx
// A: HomeScreen.tsx
function heardLabel(count: number): string {
  return count === 1 ? 'Heard once' : `Heard ${count} times`;
}
```
```ts
// B: sortOpenPoints.ts (AGENTS.md: "shows … 'heard N times' (when N ≥ 2)")
export function heardLabel(point: Pick<ImprovementPoint, 'sessionIds'>): string | null {
  const count = point.sessionIds.length;
  return count >= 2 ? `heard ${count} times` : null;
}
```

**2. Architecture: a one-off screen vs. pieces the next issues can reuse.** A rendered each point inline inside `HomeScreen.tsx`. B split it into `components/PointRow.tsx` (no data access, as AGENTS.md requires), `CategoryChip.tsx` and `EmptyState.tsx`. Issues #6 (All points) and #11 (filters) need exactly the same row, so A's version would have to be refactored or copied.

**3. Data flow.** AGENTS.md says "component → hook → `lib/storage.ts`". A called storage straight from `App`:
```tsx
// A: App.tsx
const [points] = useState(loadPoints);
```
B created the single store hook the rules describe (`src/app/useMockLoopStore.ts`).

**4. Tests.** Both runs tested the pure sort function and the screen. B's RTL tests are named after the acceptance criteria, which makes the PR checklist easy to verify:
```ts
it('"Sorted by number of sessions the point came up in (heard N times), then newest first"', …)
it('"Empty state explains how to log the first mock" when there are no points', …)
```
B also tested the loading, error and mixed Chinese/English cases; A had none of these.

**5. Where A was better.** A counted repeats as **unique** session ids (`new Set(point.sessionIds).size`), which protects against a duplicated id after a repeat-merge bug. B trusted `sessionIds.length`. A also produced a smaller diff (294 vs 462 lines) and finished faster. Rules made the output more complete and consistent, but also bigger, and they don't replace good judgment. This is why v2 adds the "`sessionIds` is a set" rule.

## 3. What the test revealed → AGENTS.md v2

| Problem seen | Run | Rule added or changed in v2 |
|---|---|---|
| Claude Code doesn't auto-load `AGENTS.md` | setup | Added a root `CLAUDE.md` with `@AGENTS.md` |
| Loading state for synchronous localStorage → "Loading…" flash on every start | B | "Loading state only for async work; read localStorage in the `useState` initializer" |
| Repeats counted with raw `length` | B (A got it right) | "Treat `sessionIds` as a set; count unique ids" |
| Comment "wired up in their own issues" without an issue number | B | "Depends on an unbuilt screen → optional prop + `// TODO(#issue)`" |
| Prettier reformatted an unrelated file | B | "Change only what the issue needs; don't reformat unrelated files" |
| Invented UI copy ("Heard once", own empty-state text) | A | "Copy UI text exactly as written" |
| Layout guessed because the mockup is missing; no visual check possible | A, B | "Mockup missing → say so and follow the text spec"; "say 'Not visually verified at 375px' instead of claiming it" |
| Only B named tests after the ACs | A | Made it an explicit rule |

### B (v1) → B2 (v2): did the refinement work?

| v2 rule | B (v1) | B2 (v2) |
|---|---|---|
| No loading flash for synchronous data | ❌ | ✅ (reads storage in the `useState` initializer; a test checks there is no loading text) |
| Unique `sessionIds` count | ❌ | ✅ (`new Set(...)`; two tests cover duplicate ids) |
| `TODO(#issue)` for unbuilt dependencies | ❌ | ✅ `// TODO(#4): wire up onLogFirstMock…` |
| No unrelated files touched | ❌ (reverted) | ✅ |
| States what was not verified | ✅ | ✅ (missing mockup, unreadable issue, no 375px check) |
| Error state kept | ✅ | ❌ **regression**: v2 said "loading only for async", and the agent extended that to dropping the error state too |

All 5 targeted v2 rules worked on the rerun (5/5). The rerun also produced a smaller diff (414 vs 461 lines) with the same 7/7 acceptance criteria. One regression shows the next refinement:

- **v3 idea:** say exactly when an error state is required ("when an operation can fail: AI calls, saving to a full storage"), instead of "every screen". A rule that is too broad gets reinterpreted, and a rule that is relaxed gets over-applied.

## 4. Conclusion

- **The rules made a measurable difference to how complete the feature was:** acceptance criteria went from 4.5/7 without rules to 7/7 with rules. Other gains: file names matching the spec (0/2 → 2/2), reusable components (0 → 3), tests named after the criteria (0 → 7), and error-state handling.
- **Some conventions held without the rules file** because the repo already encodes them: ESLint (no `any`, named exports), the existing `lib/storage.ts`, and the PRD in `docs/`. Context engineering isn't only the rules file. Lint rules, existing code and docs in the repo all shape what the agent does.
- **The rules also caused new mistakes** (a loading state that wasn't needed), and the run without rules did one thing better (unique ids). The v2 changelog in AGENTS.md records how each finding became a rule. The B2 rerun shows the refinement worked (5/5 targeted rules followed) and exposed one new ambiguity for v3.
