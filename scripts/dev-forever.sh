#!/usr/bin/env bash
# SeeQL dev supervisor — keeps :3000 alive across tool-shell exits.
cd "$(dirname "$0")/.."
while true; do
  npx next dev -p 3000 >> /tmp/dev.log 2>&1
  echo "[dev-forever] restart at $(date)" >> /tmp/dev.log
  sleep 2
done
