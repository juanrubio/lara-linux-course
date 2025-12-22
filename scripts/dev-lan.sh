#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOST_IP="${HOST_IP:-}"

if [[ -z "$HOST_IP" ]] && command -v ip >/dev/null 2>&1; then
  HOST_IP="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($i=="src") {print $(i+1); exit}}')"
fi

if [[ -z "$HOST_IP" ]] && command -v hostname >/dev/null 2>&1; then
  HOST_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
fi

if [[ -z "$HOST_IP" ]]; then
  echo "Could not determine LAN IP."
  echo "Set it manually, e.g.: HOST_IP=192.168.1.20 $0"
  exit 1
fi

if command -v ufw >/dev/null 2>&1; then
  echo "Configuring UFW to allow ports 3000 and 4000..."
  sudo -v
  sudo ufw allow 3000/tcp
  sudo ufw allow 4000/tcp

  if sudo ufw status | grep -qi "Status: inactive"; then
    echo "UFW is inactive."
    read -r -p "Enable UFW now? [y/N] " reply
    if [[ "$reply" =~ ^[Yy]$ ]]; then
      sudo ufw enable
    else
      echo "Skipping UFW enable."
    fi
  fi
else
  echo "UFW not found; skipping firewall configuration."
fi

export NEXT_PUBLIC_TERMINAL_WS_URL="ws://${HOST_IP}:4000/api/terminal"
export TERMINAL_HOST="${HOST_IP}"
export NODE_ENV=development

echo "Starting CodeQuest Academy..."
echo "Open http://${HOST_IP}:3000 from another device on your network."
echo "Press Ctrl+C to stop."

cleanup() {
  echo "Stopping servers..."
  if [[ -n "${TERM_PID:-}" ]] && kill -0 "$TERM_PID" 2>/dev/null; then
    kill "$TERM_PID"
  fi
}
trap cleanup EXIT INT TERM

node terminal-server.js &
TERM_PID=$!

node server.js
