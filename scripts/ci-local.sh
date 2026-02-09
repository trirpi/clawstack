#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Unit tests"
npx prisma generate
npm run test -- --run

echo "==> Build"
DATABASE_URL="postgresql://fake:fake@localhost:5432/fake" \
NEXTAUTH_SECRET="test-secret-for-build" \
NEXTAUTH_URL="http://localhost:3000" \
npm run build:local

echo "==> E2E"
DATABASE_URL="file:./dev.db" \
NEXTAUTH_SECRET="test-secret" \
NEXTAUTH_URL="http://localhost:3000" \
PLAYWRIGHT_WORKERS="${PLAYWRIGHT_WORKERS:-8}" \
CI=1 \
npm run test:e2e

