#!/usr/bin/env bash
set -euo pipefail

export NETLIFY_USE_YARN=false

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== netlify-ci-build ==="
node --version
npm --version
pwd
ls -la netlify.toml scripts/netlify-ci-build.sh 2>&1 || true

npm ci --include=optional
npm run db:generate
if [[ "${RUN_DB_MIGRATE_ON_BUILD:-}" == "true" && -n "${DATABASE_URL:-}" ]]; then
  npm run migrate -w @mic/db
else
  echo "[netlify-ci-build] Skipping prisma migrate deploy (set RUN_DB_MIGRATE_ON_BUILD=true to enable)."
fi
npm run build -w web
