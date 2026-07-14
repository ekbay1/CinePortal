#!/usr/bin/env bash

set -e

API_URL="${1:-http://localhost:8000}"

echo "Testing API at: $API_URL"

echo "Checking root endpoint..."
curl -fsS "$API_URL/"

echo ""
echo "Checking health endpoint..."
curl -fsS "$API_URL/health"

echo ""
echo "Checking database health endpoint..."
curl -fsS "$API_URL/health/db"

echo ""
echo "Checking content endpoint..."
curl -fsS "$API_URL/api/content/"

echo ""
echo "Checking homepage endpoint..."
curl -fsS "$API_URL/api/content/home"

echo ""
echo "Smoke test passed."