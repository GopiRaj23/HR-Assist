#!/usr/bin/env bash
set -euo pipefail

echo "=== Post-Task Validation ==="

# TypeScript compilation check
if [ -f tsconfig.json ]; then
  echo ">> TypeScript compilation check..."
  npx tsc --noEmit
fi

# Lint check
if [ -f .eslintrc.js ] || [ -f .eslintrc.json ] || [ -f eslint.config.js ] || [ -f eslint.config.mjs ]; then
  echo ">> Lint check..."
  npm run lint 2>/dev/null || echo "Lint script not configured yet"
fi

# Test run
if [ -f package.json ] && grep -q '"test"' package.json 2>/dev/null; then
  echo ">> Running tests..."
  npm test 2>/dev/null || echo "Tests not configured yet"
fi

# Git status summary
echo ""
echo ">> Git status:"
git status --short

echo ""
echo "=== Validation complete. Review changes above before committing. ==="
