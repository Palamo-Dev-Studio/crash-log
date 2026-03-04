#!/usr/bin/env bash
# ABOUTME: Build-gate verification script for The Crash Log.
# ABOUTME: Runs the Next.js production build; exits non-zero on failure.

set -euo pipefail

echo "=== verify.sh ==="
echo ""

echo "▸ Running tests..."
npm test

echo ""
echo "▸ Running production build..."
npm run build

echo ""
echo "✓ Build passed."
