# MockLoop — Product Requirements Document (P2)

> Version 2.0 (P2). Evolves the P1 single-file Claude artifact into a real web app with a repository, tests and an AI proxy.
> Source of evidence: HW2 Mom Test interviews (3 interviewees, 2026-10-12). P1 prototype: https://claude.ai/artifact/N7sqmuvc35rduBwE2i1urr

## 1. Problem

Students preparing for technical interviews do mock interviews regularly, but the feedback doesn't stick. It is spoken aloud, typed into a Zoom chat that disappears, or jotted in messy notes that are never reread. The same feedback comes back again and again: one interviewee heard "you jump into code" from **three different people**. All three interviewees had tried tracking feedback (Notes, Notion) and stopped, mainly because writing it up after a tiring mock "felt like homework".

## 2. Target users

Students and early-career job seekers preparing for SWE or data roles who do mock interviews several times a month. They are often bilingual (Chinese/English notes), on their phone right after a mock, and short on time.

## 3. Goals and non-goals

**Goals**
1. Logging a mock takes **under one minute**.
2. Before every mock, the user sees their **open improvement points** in one place.
3. Repeated feedback is **detected and surfaced** automatically.

**Non-goals (this version)**
- Finding or scheduling mock partners
- Recording or transcribing full interviews
- Question banks or solutions
- Accounts and multi-device sync

## 4. What changes from P1 to P2

| P1 (artifact) | P2 (this repo) |
|---|---|
| Single JSX file inside claude.ai | Vite + React + TypeScript project, split into features |
| Claude called from the artifact sandbox | Claude called through a small server proxy (`server/`), API key stays on the server |
| No automated tests | Vitest + React Testing Library, tests for every pure function and feature |
| Manual QA only | GitHub Actions runs lint + tests on every PR |

## 5. User stories and acceptance criteria

Priority uses MoSCoW from HW2.

### US-1 Paste notes → AI draft (Must)
As someone who just finished a mock, I want to paste my raw notes (even messy, mixed Chinese/English) and have the AI turn them into a session log, so that logging takes under a minute.
- [ ] Pasting text and clicking **Organize** produces an editable draft (date, type, partner, points with categories)
- [ ] Nothing is saved until the user confirms
- [ ] Praise ("code clean 👍") is never turned into a point; facts not in the notes are left empty, never invented
- [ ] Relative dates ("thu") are resolved from today's local date
- [ ] If the AI call fails or returns invalid JSON, the manual form opens with the notes kept

### US-2 Save feedback as improvement points (Must)
As a candidate, I want to save each piece of feedback as a specific improvement point, so that it doesn't disappear.
- [ ] Each point has text, one of 5 categories (Communication, Problem solving, Code quality, Testing, Time management) and status (open / resolved)
- [ ] Points from all sessions appear in one list
- [ ] Raw notes are stored with each session

### US-3 "Before my next mock" home screen (Must)
As someone about to start a mock, I want to see my open improvement points on one screen, so that I remember them at the right moment.
- [ ] Shows **only open** points
- [ ] Sorted by number of sessions the point came up in ("heard N times"), then newest first
- [ ] Each point shows its category and practice plan (if any)
- [ ] Empty state explains how to log the first mock
- [ ] Readable at 375px width with no horizontal scroll

### US-4 Repeated feedback detection (Should)
As a candidate, I want the app to tell me when the same feedback has come up before, so that I notice patterns.
- [ ] On save, the AI proposes matches between new and existing points, with a reason for each
- [ ] One tap confirms ("Same, link") or rejects ("Different")
- [ ] A confirmed match appends the session id to the existing point instead of duplicating it
- [ ] A resolved point that matches is reopened
- [ ] If the AI fails, points are saved as new

### US-5 Filter by category and status (Should)
- [ ] "All points" has category chips with counts and an All / Open / Resolved toggle
- [ ] Chips with 0 points are hidden; the chip row scrolls horizontally on narrow screens

### US-6 Progress over time (Could)
- [ ] Progress view shows open points per category and opened vs. resolved per week
- [ ] One-line summary: "Most open: … Resolved this week: …"
- [ ] Numbers match stored data (unit-tested)

### US-7 Edit, delete, resolve, reopen (Must)
- [ ] Sessions can be created, edited and deleted (confirm + Undo)
- [ ] Points can be edited, deleted, resolved and reopened
- [ ] Deleting a point shared by several sessions shows a warning
- [ ] All changes survive a page reload

### US-8 Practice plan (Could)
- [ ] Each point has an optional "How I'll practice" field, shown on the home screen
- [ ] Points without a plan show "+ Add a plan"

## 6. Data model (localStorage key `mockloop.v1`)

```ts
type SessionType = 'Coding' | 'Behavioral' | 'System design';
type Category = 'Communication' | 'Problem solving' | 'Code quality' | 'Testing' | 'Time management';

interface Session {
  id: string;            // crypto.randomUUID()
  date: string;          // YYYY-MM-DD, local time
  type: SessionType;
  partner?: string;
  rawNotes?: string;
  createdAt: string;     // ISO timestamp
}

interface ImprovementPoint {
  id: string;
  text: string;          // phrased as what happened: "Went quiet when stuck"
  category: Category;
  status: 'open' | 'resolved';
  sessionIds: string[];  // every session where it came up; length = "heard N times"
  practiceAction?: string;
  createdAt: string;
  resolvedAt?: string;
}
```

## 7. Screens (see `docs/mockups/`)

| Screen | File | Purpose |
|---|---|---|
| Before my next mock (home) | `mockups/01-home.png` | Open points, most repeated first |
| Log a mock | `mockups/02-log.png` | Paste notes / Log by hand tabs, editable draft |
| Repeat check | `mockups/03-repeat-check.png` | Proposed matches with reasons, Same / Different buttons |
| All points | `mockups/04-all-points.png` | Category chips + status toggle |
| Progress | `mockups/05-progress.png` | Category bars, weekly opened vs. resolved |

## 8. Non-functional requirements
- Mobile first: single column, no horizontal scroll at 375px, tap targets ≥ 44px
- Dates use local time, never UTC
- AI never invents feedback; user always confirms before saving
- API key never shipped to the browser

## 9. Success metrics
- Paste → saved session: < 60 s
- User keeps logging beyond 7 sessions (P2 interviewee quit Notion after 6–7 rows)
- Repeated feedback flagged at least once within the first ~5 sessions

## 10. Risks
- AI parsing accuracy on messy bilingual notes → editable draft + manual fallback
- Fuzzy matching of repeated feedback → user confirms every match
- localStorage is single-device → acceptable for P2, sync is a non-goal
