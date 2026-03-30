#!/bin/sh
set -e

echo "Pushing database schema..."
pnpm db:push --force

echo "Starting server..."
node dist/src/main.js
