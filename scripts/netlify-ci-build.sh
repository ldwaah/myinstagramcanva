#!/usr/bin/env bash
set -euo pipefail

export NETLIFY_USE_YARN=false

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

npm ci --include=optional
npm run db:generate
npm run build -w web
