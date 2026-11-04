# HW3 Reflection: Context Engineering for MockLoop

> Draft. The paragraphs marked ✏️ depend on your test results; rewrite them with what really happened. Target length 1–2 pages (~600–900 words).

## 1. How the rules file bridges the PRD and mockups to implementation

In P1 I built MockLoop inside one Claude Web conversation. The context lived in that chat: every prompt started with my interview evidence, and Claude remembered earlier decisions. Moving to an IDE breaks that. Every new chat starts from zero, and the agent only sees the code, not *why* the code looks the way it does. AGENTS.md is my way of putting that "why" into the repository.

The file translates the PRD into rules at three levels. **Vocabulary:** the PRD talks about *improvement points*, *heard N times* and *open / resolved*, so AGENTS.md lists these as required domain terms. Without it, an agent could reasonably call them "tips" or "feedback items", and the code and the PRD would drift apart. **Behaviour:** the user flows section turns US-1 and US-4 into concrete steps (paste → Organize → editable draft → Save → repeat check), including the failure path from my P1 testing ("keep the notes and open the manual form"). **Design:** the mockups can't be read reliably from a PNG alone, so I wrote down the measurable parts: 375px with no horizontal scroll, 44px tap targets, the exact sort order on the home screen, and the empty-state text.

I also turned lessons from P1 into rules. P1 taught me that Claude rewrote feedback as advice ("Keep talking") instead of what happened ("Went quiet"), that UTC dates showed the wrong day in the evening, and that an empty draft row silently blocked saving. Each of these is now a line in the Do's and Don'ts, so the same mistakes cost me nothing the second time.

## 2. How the Scrum setup helps AI-assisted development

The GitHub issues work as **prompts with acceptance criteria attached**. In P1 my best prompt was the last one: "review the app against these acceptance criteria". It found four real gaps. In P2 the criteria exist *before* the first line of code, in every issue, as a checklist. AGENTS.md tells the agent to read the issue first and to write one test per criterion, so the definition of done is the same for me and for the AI.

Breaking the PRD into 16 small issues also keeps each AI task small. A request like "build the home screen" (#5) fits in one chat and one PR, which is easy to review. The board shows me what the AI has produced and what I still need to check (In Review). Branch names and commit messages that include the issue number (`feature/5-before-next-mock`, `feat(home): … (#5)`) connect each piece of generated code to the requirement that asked for it. When something breaks later, I can trace it back.

## 3. What the before/after test showed ✏️

*(Replace with your real numbers from docs/before-after-comparison.md.)*

Without rules, the agent ___ (e.g. put everything in App.tsx, read localStorage inside the component, invented a `count` field instead of using `sessionIds.length`, and wrote one snapshot test). With rules, it ___ (e.g. created `features/home/` with a pure `sortOpenPoints.ts`, met __/7 acceptance criteria compared with __/7, and wrote __ tests that query by role).

The biggest difference was ___. The rules made less difference than I expected in ___.

## 4. What I changed after testing (iteration) ✏️

The test showed gaps in my first version of the rules:
- ___ → I added the rule "___" (AGENTS.md v2, see the Changelog).
- ___ → I made "___" more specific.

After the change I reran the with-rules test once: ___.

## 5. What I would add or change for Sprint 2

- **Prompt templates per issue type** (feature / bug / chore), so I don't rewrite the same instructions each time.
- **Rules per folder**, e.g. a short `server/AGENTS.md` for the AI proxy (prompt rules, error handling), so the root file stays readable.
- **Golden test data:** commit the bilingual sample notes from HW1 as a fixture, so every AI-parsing change is tested against the same messy input.
- **A PR template** that copies the issue's acceptance criteria automatically.
- ✏️ ___ (something the test revealed)

The main thing I learned is that context engineering is the same lesson as P1, applied more widely. In P1, prompts that started with evidence worked better than feature requests. In P2, a repo that carries its own evidence (PRD, mockups, rules, acceptance criteria) gets better results than an agent that only reads the code.
