#!/usr/bin/env bash
# Creates labels, milestones, 16 issues and a Project board for MockLoop.
# Usage:  bash scripts/setup_github.sh <owner>/<repo>
# Needs:  gh CLI logged in, with project scope:  gh auth refresh -s project
# Run it once on a NEW repo, so the issue numbers (#1…#16) match AGENTS.md and the comparison doc.
set -euo pipefail

REPO="${1:?usage: bash scripts/setup_github.sh owner/repo}"
OWNER="${REPO%%/*}"

# ---- Sprint dates (edit to match your course timeline) ----
SPRINT1_DUE="2026-11-18T23:59:00Z"
SPRINT2_DUE="2026-12-02T23:59:00Z"

echo "== Labels"
label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force; }
label feature          1D76DB "New user-facing functionality"
label bug              D73A4A "Something isn't working"
label chore            BFBFBF "Tooling, setup, refactoring"
label docs             0E8A16 "Documentation"
label "priority:high"  B60205 "Must have (MoSCoW)"
label "priority:medium" FBCA04 "Should have"
label "priority:low"   C2E0C6 "Could have"

echo "== Milestones"
gh api "repos/$REPO/milestones" -f title="Sprint 1" -f due_on="$SPRINT1_DUE" \
  -f description="Core loop: scaffold, storage, manual log, home screen, AI paste notes" >/dev/null
gh api "repos/$REPO/milestones" -f title="Sprint 2" -f due_on="$SPRINT2_DUE" \
  -f description="Repeat detection, filters, progress, practice plans, polish" >/dev/null

ISSUE_URLS=()
issue() { # title labels milestone body
  local url
  url=$(gh issue create --repo "$REPO" --title "$1" --label "$2" --milestone "$3" --body "$4")
  echo "  $url"
  ISSUE_URLS+=("$url")
}

echo "== Sprint 1 issues"

issue "Scaffold Vite + React + TypeScript project with Tailwind and Vitest" "chore,priority:high" "Sprint 1" \
"Set up the project skeleton described in AGENTS.md §1.

**Acceptance criteria**
- [ ] Vite 5 + React 18 + TypeScript (strict) app runs with \`npm run dev\`
- [ ] Tailwind 3 configured; a sample class renders
- [ ] Vitest + React Testing Library + jsdom configured; \`npm test\` runs one passing smoke test
- [ ] ESLint (flat config) + Prettier; \`npm run lint\` passes
- [ ] Folder structure matches AGENTS.md (app/, components/, features/, lib/, types/, server/)
- [ ] \`.env.example\` and \`.gitignore\` (ignores .env, node_modules, dist)"

issue "Set up GitHub Actions CI for lint and tests" "chore,priority:medium" "Sprint 1" \
"**Acceptance criteria**
- [ ] \`.github/workflows/ci.yml\` runs \`npm ci\`, \`npm run lint\`, \`npm test\` on every PR and push to main
- [ ] Uses Node 20 with npm cache
- [ ] A failing test makes the check red
- [ ] README shows the CI badge"

issue "Add data model types and localStorage repository (mockloop.v1)" "feature,priority:high" "Sprint 1" \
"Implements the data model in docs/PRD.md §6. Supports US-2 and US-7.

**Acceptance criteria**
- [ ] \`types/models.ts\` defines Session, ImprovementPoint, Category (5 values), SessionType (3 values)
- [ ] \`lib/schemas.ts\` has zod schemas for both models
- [ ] \`lib/storage.ts\` exposes load/save for sessions and points under key \`mockloop.v1\`
- [ ] Corrupted or missing data falls back to empty lists without crashing
- [ ] \`lib/dates.ts\` returns today as local YYYY-MM-DD (not UTC) and formats \`Sun, Oct 18\`
- [ ] Unit tests cover save → load round trip, corrupted JSON, and the local-date edge case"

issue "Log a mock by hand and manage sessions" "feature,priority:high" "Sprint 1" \
"**User story (US-7, part 1):** As a user, I want to create, edit and delete sessions so that my record stays accurate.

**Acceptance criteria**
- [ ] Log tab has a manual form: date (required, not in the future), type (required), partner (optional), ≥1 point with category
- [ ] Errors show under each field; typed input is kept after a failed submit
- [ ] Session list is newest first; each session can be edited and deleted
- [ ] Delete asks for confirmation and offers Undo
- [ ] Data survives a page reload
- [ ] RTL test: fill the form → save → session appears; submit empty → errors shown

**Design ref:** docs/mockups/02-log.png"

issue "Build \"Before my next mock\" home screen" "feature,priority:high" "Sprint 1" \
"**User story (US-3):** As someone about to start a mock, I want to see my open improvement points on one screen, so that I remember them at the right moment.

**Acceptance criteria**
- [ ] Home is the default tab and shows **only open** points
- [ ] Sorted by \`sessionIds.length\` (desc), then \`createdAt\` (desc)
- [ ] Each point shows its text, category chip, and \"heard N times\" when N ≥ 2
- [ ] Shows the practice plan under the point if present, otherwise \"+ Add a plan\"
- [ ] Empty state: \"No open points. Log your first mock →\" linking to the Log tab
- [ ] No horizontal scroll at 375px; tap targets ≥ 44px
- [ ] Unit tests for the sort function; RTL test for the list and the empty state

**Design ref:** docs/mockups/01-home.png"

issue "Resolve, reopen, edit and delete improvement points" "feature,priority:high" "Sprint 1" \
"**User stories (US-2, US-7):** Save feedback as points and keep them accurate.

**Acceptance criteria**
- [ ] A point can be marked resolved (sets \`resolvedAt\`) and reopened (clears it)
- [ ] Point text and category can be edited inline
- [ ] Deleting a point shared by more than one session shows a warning first
- [ ] Resolved points disappear from Home but stay in All points
- [ ] Changes survive a reload
- [ ] RTL test: resolve → gone from Home; reopen → back

**Design ref:** docs/mockups/04-all-points.png"

issue "Add Express proxy for Claude API calls" "chore,priority:high" "Sprint 1" \
"Keep the API key off the client (AGENTS.md §4 Security).

**Acceptance criteria**
- [ ] \`server/index.ts\` Express app with \`POST /api/organize\`; Vite dev server proxies \`/api\`
- [ ] Reads \`ANTHROPIC_API_KEY\` and \`ANTHROPIC_MODEL\` from \`server/.env\`
- [ ] Rejects bodies over 10,000 characters with 413
- [ ] Returns a generic error message on failure (no stack trace, no request logging)
- [ ] Unit test with the SDK mocked"

issue "Paste notes and organize them with AI into an editable draft" "feature,priority:high" "Sprint 1" \
"**User story (US-1):** As someone who just finished a mock, I want to paste raw notes and have the AI turn them into a session log, so that logging takes under a minute.

**Acceptance criteria**
- [ ] Log tab has a \"Paste notes\" mode with a textarea and an **Organize** button (disabled and busy while loading)
- [ ] The response is validated with zod and opens as an editable draft; nothing is saved until **Save mock**
- [ ] Praise is not turned into a point; missing fields stay empty; relative dates are resolved from local today
- [ ] Works with mixed Chinese/English notes (test input in docs/PRD.md)
- [ ] On AI failure or invalid JSON: message shown and manual form opened **with notes kept**
- [ ] Tests: parse a valid response, an invalid response → fallback

**Design ref:** docs/mockups/02-log.png"

issue "Add PRD and mockup screenshots to docs/" "docs,priority:medium" "Sprint 1" \
"**Acceptance criteria**
- [ ] \`docs/PRD.md\` with US-1…US-8 and acceptance criteria
- [ ] 5 screenshots from the P1 prototype in \`docs/mockups/\` (01-home … 05-progress), at 375px width
- [ ] README links to the PRD, the mockups and AGENTS.md"

echo "== Sprint 2 issues"

issue "Detect repeated feedback with one-tap confirm" "feature,priority:medium" "Sprint 2" \
"**User story (US-4):** As a candidate, I want the app to tell me when the same feedback has come up before, so that I notice patterns.

**Acceptance criteria**
- [ ] \`POST /api/repeat-check\` returns proposed matches (newPointIndex, existingPointId, reason)
- [ ] RepeatCheck screen shows each match with its reason and **Same, link** / **Different** buttons
- [ ] Confirming appends the session id to the existing point (no duplicate)
- [ ] A resolved point that matches is reopened
- [ ] On AI failure the points are saved as new
- [ ] Tests for the merge logic, including reopen

**Design ref:** docs/mockups/03-repeat-check.png"

issue "Filter all points by category and status" "feature,priority:medium" "Sprint 2" \
"**User story (US-5)**

**Acceptance criteria**
- [ ] Category chips show counts; chips with 0 are hidden
- [ ] All / Open / Resolved toggle
- [ ] The chip row scrolls horizontally at 375px (no page scroll)
- [ ] Unit tests for the filter and count functions"

issue "Show progress view with category bars and weekly trend" "feature,priority:low" "Sprint 2" \
"**User story (US-6)**

**Acceptance criteria**
- [ ] Open points per category as div bars (no chart library)
- [ ] Opened vs. resolved per week
- [ ] One-line summary \"Most open: … Resolved this week: …\"
- [ ] Unit tests prove the numbers match the stored data

**Design ref:** docs/mockups/05-progress.png"

issue "Add practice plan field to improvement points" "feature,priority:low" "Sprint 2" \
"**User story (US-8)**

**Acceptance criteria**
- [ ] Optional \"How I'll practice\" field on each point (create and edit)
- [ ] Shown under the point on Home; \"+ Add a plan\" when empty
- [ ] Persists across reloads"

issue "Load and remove sample data for demos and graders" "feature,priority:low" "Sprint 2" \
"**Acceptance criteria**
- [ ] \"Try with sample data\" on the empty Home loads 4 example sessions
- [ ] ⋯ menu → \"Remove sample data\" removes only sample records (marked with a flag)
- [ ] Every tab has content after loading"

issue "Mobile and accessibility audit" "chore,priority:medium" "Sprint 2" \
"**Acceptance criteria**
- [ ] No horizontal scroll on any screen at 375px
- [ ] All tap targets ≥ 44px
- [ ] All inputs labelled; errors linked with aria-describedby
- [ ] Full keyboard navigation; dialogs trap focus and close on Esc
- [ ] axe / Lighthouse accessibility score ≥ 90"

issue "Empty draft point row silently blocks Save mock" "bug,priority:high" "Sprint 2" \
"Regression from P1: when every drafted point matched existing feedback, an empty point row with a preselected category blocked **Save mock** with no visible error.

**Steps to reproduce**
1. Paste notes whose points all match existing points
2. Confirm all matches
3. Click Save mock → nothing happens

**Acceptance criteria**
- [ ] Empty point rows are ignored on save
- [ ] If save is blocked, the page scrolls to the first error
- [ ] Regression test reproduces the case above"

echo "== Project board"
if gh auth status 2>&1 | grep -q "'project'"; then
  bash "$(dirname "$0")/setup_project.sh" "$REPO"
else
  echo "  Skipped: token lacks the 'project' scope."
  echo "  Run: gh auth refresh -h github.com -s project && bash scripts/setup_project.sh $REPO"
  exit 0
fi
  1. Open the project "MockLoop Scrum" → switch the view to **Board** layout.
  2. Edit the Status field options to: Backlog, Sprint Todo, In Progress, In Review, Done.
  3. Move issues #1–#9 (Sprint 1) to **Sprint Todo**, and #10–#16 to **Backlog**.
  4. Take screenshots of the board, the milestones page and one issue for Canvas.
EOF
