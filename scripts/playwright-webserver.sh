#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_PATH="$ROOT_DIR/prisma/schema.prisma"
SQLITE_SCHEMA_PATH="$ROOT_DIR/prisma/schema.sqlite.prisma"
BACKUP_PATH="$ROOT_DIR/prisma/schema.prisma.playwright.bak"

cleanup() {
  if [[ -f "$BACKUP_PATH" ]]; then
    mv "$BACKUP_PATH" "$SCHEMA_PATH"
  fi
}

trap cleanup EXIT

cp "$SCHEMA_PATH" "$BACKUP_PATH"
cp "$SQLITE_SCHEMA_PATH" "$SCHEMA_PATH"

export DATABASE_URL="file:./dev.db"
export PRISMA_HIDE_UPDATE_MESSAGE="1"
export NO_COLOR="${NO_COLOR:-}"
export FORCE_COLOR="${FORCE_COLOR:-0}"

npm run db:local:ci
npm run dev -- --hostname 127.0.0.1 --port 3001
