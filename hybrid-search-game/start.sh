#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-8000}"
URL="http://localhost:${PORT}/Hybrid%20Search%20Game.html"

if PIDS="$(lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN -t 2>/dev/null)" && [ -n "${PIDS}" ]; then
  echo "Port ${PORT} is already in use by PID(s): ${PIDS}"
  echo "Details:"
  lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN
  echo
  echo "Run the following to free the port, then retry:"
  echo "  kill $(echo "${PIDS}" | tr '\n' ' ')"
  echo "  # or force:  kill -9 $(echo "${PIDS}" | tr '\n' ' ')"
  exit 1
fi

echo "Starting Hybrid Search Game on ${URL}"

if command -v open >/dev/null 2>&1; then
  (sleep 1 && open "${URL}") &
fi

exec python3 -m http.server "${PORT}"
