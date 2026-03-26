#!/bin/sh
set -e
cd /app
if [ ! -f node_modules/.install-stamp ] || [ package-lock.json -nt node_modules/.install-stamp ]; then
  npm ci
  touch node_modules/.install-stamp
fi
exec npm run dev -- --host 0.0.0.0 --port 5173
