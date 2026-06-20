#!/bin/bash
# E2E Smoke Tests for Lapak

MARKETING="https://b067f355.lapak-marketing.pages.dev"

echo "🔍 E2E Smoke Tests - $(date)"
echo "======================================"
echo

# Test marketing site pages
PAGES=(
  "/"
  "/features/"
  "/pricing/"
  "/ai-credits/"
  "/login/"
  "/signup/"
  "/docs/"
)

echo "📄 Testing Marketing Pages"
MARKETING_PASS=0
MARKETING_TOTAL=${#PAGES[@]}

for page in "${PAGES[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "${MARKETING}${page}")
  if [ "$CODE" -eq 200 ]; then
    echo "  ✅ ${page} - ${CODE}"
    ((MARKETING_PASS++))
  else
    echo "  ❌ ${page} - ${CODE}"
  fi
done

echo
echo "📊 Results:"
echo "  Marketing: ${MARKETING_PASS}/${MARKETING_TOTAL} passed"
echo

if [ $MARKETING_PASS -eq $MARKETING_TOTAL ]; then
  echo "✅ ALL SMOKE TESTS PASSED"
  exit 0
else
  echo "❌ SMOKE TESTS FAILED"
  exit 1
fi
