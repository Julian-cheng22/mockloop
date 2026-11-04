# Before/After Test: Same Feature With and Without AGENTS.md

> Fill in every `___` with what actually happened. Paste screenshots into `docs/comparison/`.

## 1. Methodology

| Item | Value |
|---|---|
| Feature | Issue **#5: Build "Before my next mock" home screen** (US-3) |
| Why this feature | It has a clear spec (sorting, filtering, empty state, mobile layout), it needs no API key, and it is easy to measure |
| Starting commit | `___` (main after #1 scaffold and #3 storage were merged, so both runs start from the same code) |
| Tool / model | `___` (e.g. Antigravity + Gemini 3 Pro); same for both runs |
| Conditions | New chat each run, no earlier conversation, same prompt, accept the AI's first complete answer, with no manual fixes before measuring |

### Run A: without rules
```bash
git checkout -b test/5-no-rules main
git mv AGENTS.md AGENTS.md.off   # also disable any IDE rules or memory
git commit -m "chore: disable rules for HW3 test"
```
Prompt (brief description only):
```
Build a home screen for my mock interview app that shows the feedback points I still need to work on,
with the most repeated ones first. Include tests.
```

### Run B: with rules
```bash
git checkout -b test/5-with-rules main   # AGENTS.md present
```
Prompt (the same sentence, plus a pointer to the issue, PRD and mockup):
```
Build a home screen for my mock interview app that shows the feedback points I still need to work on,
with the most repeated ones first. Include tests.
This is GitHub issue #5 (US-3 in docs/PRD.md); the mockup is docs/mockups/01-home.png.
```

### Measuring
In each branch, run:
```bash
bash scripts/measure.sh
```
Then go through the acceptance criteria of #5 by hand at 375px width in DevTools.

---

## 2. Results

### 2.1 Measurable metrics

| Metric | Without rules | With rules | Source |
|---|---|---|---|
| Acceptance criteria of #5 met (out of 7) | ___ / 7 | ___ / 7 | manual check below |
| Files placed per architecture (`features/home/…`) | ___ | ___ | `git diff --stat` |
| Naming convention violations | ___ | ___ | review against AGENTS.md table |
| Uses domain words (point, heard N times, open/resolved) | ___ | ___ | grep |
| `localStorage` / `fetch` used directly in a component | ___ | ___ | measure.sh |
| `any` types | ___ | ___ | measure.sh |
| New dependencies added | ___ | ___ | `package.json` diff |
| Test files / test cases | ___ / ___ | ___ / ___ | measure.sh |
| Tests passing | ___ | ___ | `npm test` |
| Lint errors | ___ | ___ | `npm run lint` |
| Empty state present | ☐ | ☐ | manual |
| Horizontal scroll at 375px | ☐ yes ☐ no | ☐ yes ☐ no | DevTools |
| Accessibility (labels, roles, tap ≥ 44px) | ___ | ___ | manual / Lighthouse |

### 2.2 Acceptance criteria checklist (#5)

| Criterion | A | B |
|---|---|---|
| Home is the default tab, only open points | | |
| Sorted by sessionIds.length desc, then createdAt desc | | |
| Text + category chip + "heard N times" when N ≥ 2 | | |
| Practice plan or "+ Add a plan" | | |
| Empty state linking to Log | | |
| No horizontal scroll at 375px; tap targets ≥ 44px | | |
| Unit test for the sort + RTL test for the list and empty state | | |

### 2.3 Qualitative differences (add a code snippet or screenshot for each)

**Code quality and consistency with project patterns**
- Without rules: ___ (e.g. put everything in `App.tsx`; sorted inside the component)
- With rules: ___

**Understanding of the design/mockup intent**
- Without rules: ___ (e.g. didn't know what "repeated" means → invented a `count` field)
- With rules: ___

**Naming conventions and architecture**
- Without rules: ___
- With rules: ___

**Quality of the generated tests**
- Without rules: ___ (e.g. one snapshot test; queries by class name)
- With rules: ___

**Screenshots:** `docs/comparison/A-code.png`, `B-code.png`, `A-375px.png`, `B-375px.png`

---

## 3. What the test revealed about the rules (input for v2)

| Problem seen in Run B (with rules) | Rule added or changed in AGENTS.md v2 |
|---|---|
| ___ | ___ |
| ___ | ___ |

After updating AGENTS.md, **rerun Run B once** (new chat, same prompt) and record the result here:

| Metric | B (v1 rules) | B (v2 rules) |
|---|---|---|
| Acceptance criteria met | ___ / 7 | ___ / 7 |
| ___ | ___ | ___ |
