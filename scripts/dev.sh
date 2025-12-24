#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export NEXT_PUBLIC_TERMINAL_WS_URL="ws://localhost:4000/api/terminal"
export NODE_ENV=development

echo "Starting CodeQuest Academy (local development)..."
echo "Open http://localhost:3000 in your browser."
echo "Press Ctrl+C to stop."

cleanup() {
  echo "Stopping servers..."
  if [[ -n "${TERM_PID:-}" ]] && kill -0 "$TERM_PID" 2>/dev/null; then
    kill "$TERM_PID"
  fi
}
trap cleanup EXIT INT TERM

# Start terminal server in background
node terminal-server.js &
TERM_PID=$!

# Start Next.js server in foreground
node server.js
