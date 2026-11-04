#!/usr/bin/env bash
# Creates the "MockLoop Scrum" GitHub Project, links it to the repo and adds every open issue.
# Usage:  bash scripts/setup_project.sh <owner>/<repo>
# Needs:  gh auth refresh -h github.com -s project
set -euo pipefail

REPO="${1:?usage: bash scripts/setup_project.sh owner/repo}"
OWNER="${REPO%%/*}"
TITLE="MockLoop Scrum"

PROJECT_NUM=$(gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.title==\"$TITLE\") | .number" | head -1)
if [ -z "$PROJECT_NUM" ]; then
  PROJECT_NUM=$(gh project create --owner "$OWNER" --title "$TITLE" --format json --jq .number)
  echo "Created project #$PROJECT_NUM"
fi
gh project link "$PROJECT_NUM" --owner "$OWNER" --repo "$REPO" >/dev/null 2>&1 || true

gh issue list --repo "$REPO" --state open --limit 100 --json url --jq '.[].url' | while read -r u; do
  gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$u" >/dev/null
  echo "  added $u"
done

cat <<EOF

Done: https://github.com/users/$OWNER/projects/$PROJECT_NUM
Finish these steps in the browser:
  1. Switch the view to **Board** layout.
  2. Edit the Status field options to: Backlog, Sprint Todo, In Progress, In Review, Done.
  3. Move issues #1–#9 (Sprint 1) to **Sprint Todo**, and #10–#16 to **Backlog**.
  4. Take screenshots of the board, the milestones page and one issue for Canvas.
EOF
