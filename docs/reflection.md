# HW3 Reflection: Context Engineering for MockLoop

## 1. How the rules file bridges the PRD and mockups to implementation

In P1 I built MockLoop inside one Claude Web conversation. The context lived in that chat: every prompt started with my interview evidence, and Claude remembered earlier decisions. Moving to an IDE breaks that. Every new session starts from zero, and the agent only sees the code, not *why* the code looks the way it does. AGENTS.md is my way of putting that "why" into the repository.

The file translates the PRD into rules at three levels. **Vocabulary:** the PRD talks about *improvement points*, *heard N times* and *open / resolved*, so AGENTS.md lists these as required domain terms. **Behaviour:** the user-flow section turns US-1 and US-4 into concrete steps (paste → Organize → editable draft → Save → repeat check), including the failure path from P1 testing. **Design:** a PNG mockup can't be read reliably, so I wrote down the measurable parts: 375px with no horizontal scroll, 44px tap targets, the exact sort order on the home screen, and the exact empty-state text.

I also turned P1 lessons into rules. In P1 Claude rewrote feedback as advice ("Keep talking") instead of what happened ("Went quiet"), UTC dates showed the wrong day in the evening, and an empty draft row silently blocked saving. Each became a line in the Do's and Don'ts, and the UTC bug became a test that runs in the New York timezone.

## 2. How the Scrum setup helps AI-assisted development

The GitHub issues work as **prompts with acceptance criteria attached**. In P1 my most productive prompt was the last one: "review the app against these acceptance criteria". In P2 the criteria exist before the first line of code, as a checklist in each issue. AGENTS.md tells the agent to write one test per criterion, so "done" means the same thing to me and to the AI. The test showed this works: the runs with rules named their tests after the criteria, which made checking the 7 criteria of #5 almost mechanical.

Splitting the PRD into 16 small issues keeps each AI task the size of one session and one PR. Branch names and commits carry the issue number (`feature/3-data-model-storage`, `feat(storage): … (#3)`), and PR bodies repeat the checklist with "How I tested". So every piece of generated code can be traced back to the requirement that asked for it. The board shows which AI output still needs my review.

## 3. What the before/after test showed

I implemented issue #5 three times from the same commit with the same prompt, each in a brand-new agent session: **A** without a rules file, **B** with AGENTS.md v1, and **B2** with the refined v2. Full data is in `docs/before-after-comparison.md`.

- **Completeness:** A met 4.5 of 7 acceptance criteria, while B and B2 met all 7. A invented its own UI copy ("Heard once" on every point, a different empty-state text) and left out "+ Add a plan". The PRD only shows "heard N times" for repeated feedback, because one occurrence isn't a pattern.
- **Architecture:** A wrote one 73-line screen with everything inline and read storage straight from `App`. B followed the file names in the rules (2/2), built 3 reusable components that #6 and #11 will need, and added the store hook the rules describe.
- **Tests:** A wrote 15 tests, none named after a criterion. B wrote 22, with 7 named after a criterion, and covered loading, error and mixed Chinese/English input.

The surprise was how much A got right **without** rules. It found `docs/PRD.md` by itself, and ESLint (from issue #1) already enforced "no `any`" and named exports. Conventions written into tooling hold even when the rules file is missing. A even beat B in one place: it counted repeats as **unique** session ids, which protects against a duplicate-id bug, and B didn't.

## 4. What I changed after testing (iteration)

The test exposed gaps in v1, and I turned each into a v2 rule (Changelog in AGENTS.md):

1. **Claude Code doesn't read AGENTS.md on its own.** I added a one-line `CLAUDE.md` (`@AGENTS.md`). Without it, my "with rules" run would silently have been a "without rules" run.
2. **"Handle loading, error and empty states" was too broad.** B added a loading state for synchronous localStorage, so the screen flashed "Loading…" on every start. v2: loading only for async work.
3. **`sessionIds` is a set.** I took this from A's better behaviour.
4. **`TODO(#issue)` for unbuilt dependencies**, **don't touch unrelated files** (B's Prettier run reformatted another file), **copy UI text exactly**, and **say what you didn't verify** (no run could open a browser, and the mockup PNG is still missing).

I then reran B with v2 (B2). **All 5 targeted rules were followed** (no loading flash, unique ids, `TODO(#4)`, no unrelated files, honest "not visually verified"), still at 7/7 criteria and with a smaller diff (414 vs 461 lines). But B2 also **dropped the error state** that B had. It read "loading only for async" as "no state handling needed for local data". That taught me that rules interact: when I relaxed one rule, the agent over-applied the change to a neighbouring one.

## 5. What I would add or change for Sprint 2

- **v3 rule:** an error state is required "when an operation can fail (AI calls, saving to full storage)", not on "every screen".
- **Commit the mockups (#9) before more UI work.** All three runs had to guess the layout from text.
- **Move more rules into tooling:** a lint rule against `toISOString().slice`, a test helper for AC-named tests, and a PR template that copies the issue checklist. The test showed that tooling enforces conventions more reliably than prose.
- **Rules per folder:** a short `server/AGENTS.md` for the AI proxy (#7, #8), so the root file stays readable.
- **Golden test data:** commit the bilingual HW1 sample notes as a fixture for every AI-parsing change.

What I learned is that context engineering is the P1 lesson applied more widely. In P1, prompts that started with evidence beat bare feature requests. In P2, a repo that carries its own evidence (PRD, rules, acceptance criteria, lint rules) gets better results from an agent that starts with nothing. But the rules file is itself code: it has bugs, it needs tests (the before/after runs), and every fix can cause a regression somewhere else.
