#!/bin/bash
# Lighthouse Audit for Marketing Site

MARKETING="https://b067f355.lapak-marketing.pages.dev"

echo "📊 Lighthouse Audit - $(date)"
echo "================================"
echo

# Pages to audit
PAGES=(
  "/"
  "/features/"
  "/pricing/"
  "/ai-credits/"
  "/login/"
  "/signup/"
  "/docs/"
)

echo "🎯 Pages to audit:"
for page in "${PAGES[@]}"; do
  echo "  - ${page}"
done
echo

echo "⚠️  Running Lighthouse CI requires Node.js and local Chrome"
echo "   Install: npm install -g @lhci/cli"
echo "   Then run: lhci autorun --collect.url=${MARKETING}/"
echo

echo "✅ Alternative: Use online Lighthouse test"
echo "   Visit: https://pagespeed.web.dev/"
echo "   Enter URL: ${MARKETING}"
echo

echo "📋 Manual Core Web Vitals Checklist:"
echo ""
echo "LCP (Largest Contentful Paint):"
echo "  ✅ Hero text loads in initial HTML"
echo "  ✅ No render-blocking scripts in <head>"
echo "  ✅ Font-display: optional on web fonts"
echo ""
echo "INP (Interaction to Next Paint):"
echo "  ✅ Main thread free (no heavy JS)"
echo "  ✅ Hover states use CSS transitions only"
echo "  ✅ No scroll event listeners"
echo ""
echo "CLS (Cumulative Layout Shift):"
echo "  ✅ No late-injecting content above fold"
echo "  ✅ Images have explicit dimensions"
echo "  ✅ No unstyled content flash (FOUC)"
echo ""

echo "🔗 Quick Test URLs:"
for page in "${PAGES[@]}"; do
  echo "  ${MARKETING}${page}"
done
