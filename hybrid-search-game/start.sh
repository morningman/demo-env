#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

MODE="${1:-dev}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Install it with: npm i -g pnpm" >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "==> Installing dependencies..."
  pnpm install
fi

case "$MODE" in
  dev)
    echo "==> Starting dev server at http://localhost:3000"
    exec pnpm dev
    ;;
  build)
    echo "==> Building production bundle..."
    exec pnpm build
    ;;
  start)
    if [ ! -d .next ]; then
      echo "==> No build found, building first..."
      pnpm build
    fi
    echo "==> Starting production server at http://localhost:3000"
    exec pnpm start
    ;;
  *)
    echo "Usage: $0 [dev|build|start]" >&2
    exit 1
    ;;
esac
