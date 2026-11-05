#!/usr/bin/env bash
# Prints objective metrics for the HW3 before/after comparison.
# Run from the repo root on each test branch:  bash scripts/measure.sh
set -uo pipefail
BASE="${1:-main}"

echo "Branch: $(git branch --show-current)   (compared with $BASE)"
echo
echo "== Files changed"
git diff --stat "$BASE"...HEAD -- . ':!AGENTS.md' ':!AGENTS.md.off'
echo
echo "== New files outside the architecture folders (src/app|components|features|lib|types, server/)"
git diff --name-only --diff-filter=A "$BASE"...HEAD \
  | grep -E '^src/' | grep -vE '^src/(app|components|features|lib|types|test)/' || echo "  none"
echo
echo "== Direct localStorage/fetch in .tsx components (should be 0)"
grep -rnE 'localStorage|fetch\(' src --include='*.tsx' | grep -v '\.test\.tsx' | wc -l
echo "== 'any' types (should be 0)"
grep -rnE ':\s*any\b|as any\b|<any>' src server 2>/dev/null | wc -l
echo "== Default exports outside App.tsx (should be 0)"
grep -rn 'export default' src --include='*.ts' --include='*.tsx' | grep -v 'App.tsx' | wc -l
echo "== UTC date bug pattern toISOString().slice (should be 0)"
grep -rn 'toISOString().slice' src --include='*.ts' --include='*.tsx' | grep -v '\.test\.' | grep -vE ':[0-9]+:\s*//' | wc -l
echo
echo "== Dependency changes"
git diff "$BASE"...HEAD -- package.json | grep -E '^[+-]\s+"' || echo "  none"
echo
echo "== Tests"
echo "test files: $(find src server -name '*.test.ts' -o -name '*.test.tsx' 2>/dev/null | wc -l)"
echo "test cases: $(grep -rhoE '\b(it|test)\(' src server 2>/dev/null | wc -l)"
npm test --silent -- --run 2>&1 | tail -5
echo
echo "== Lint"
npm run lint --silent 2>&1 | tail -3
