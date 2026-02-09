#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Avoid NO_COLOR/FORCE_COLOR conflict warnings during test runs.
unset FORCE_COLOR

# Generate a Prisma client and database from the SQLite schema used for E2E.
npm run db:local:ci

export DATABASE_URL="file:./dev.db"
npm run dev -- --webpack --hostname 127.0.0.1 --port 3001
