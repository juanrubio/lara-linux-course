#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Explicitly unset any existing environment variable
unset NEXT_PUBLIC_TERMINAL_WS_URL 2>/dev/null || true
unset TERMINAL_HOST 2>/dev/null || true

# Set for localhost explicitly
export NEXT_PUBLIC_TERMINAL_WS_URL="ws://localhost:4000/api/terminal"
export NODE_ENV=development

echo "========================================"
echo "Starting CodeQuest Academy (LOCALHOST)"
echo "========================================"
echo ""
echo "Environment:"
echo "  NEXT_PUBLIC_TERMINAL_WS_URL=${NEXT_PUBLIC_TERMINAL_WS_URL}"
echo "  NODE_ENV=${NODE_ENV}"
echo ""

# Clear Next.js cache to ensure fresh environment variables
if [ -d ".next" ]; then
  echo "Clearing Next.js cache..."
  rm -rf .next
  echo "Cache cleared."
  echo ""
fi

echo "Open http://localhost:3000 in your browser."
echo "Debug page: http://localhost:3000/debug"
echo ""
echo "Press Ctrl+C to stop."
echo ""

cleanup() {
  echo ""
  echo "Stopping servers..."
  if [[ -n "${TERM_PID:-}" ]] && kill -0 "$TERM_PID" 2>/dev/null; then
    kill "$TERM_PID"
  fi
}
trap cleanup EXIT INT TERM

# Start terminal server in background
node terminal-server.js &
TERM_PID=$!

# Wait a moment for terminal server to start
sleep 1

# Start Next.js server in foreground
node server.js
