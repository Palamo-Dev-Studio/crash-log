#!/usr/bin/env bash
# ABOUTME: Build-gate verification script for The Crash Log.
# ABOUTME: Runs lint, format check, tests, and production build; exits non-zero on failure.

set -euo pipefail

echo "=== verify.sh ==="
echo ""

echo "▸ Checking lint..."
npm run lint

echo ""
echo "▸ Checking formatting..."
npm run format:check

echo ""
echo "▸ Running tests..."
npm test

echo ""
echo "▸ Running production build..."
npm run build

echo ""
echo "✓ All checks passed."
