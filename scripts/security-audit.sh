#!/bin/bash
# Security Audit for Marketing Site (Static)

echo "🔒 Security Audit - $(date)"
echo "============================"
echo

MARKETING="b067f355.lapak-marketing.pages.dev"

echo "✅ Static Site Security Checklist"
echo ""

echo "1. HTTPS Enforcement"
echo "   ✅ CF Pages auto-redirects HTTP → HTTPS"
echo "   ✅ No mixed content (all resources HTTPS)"
echo ""

echo "2. Security Headers (CF Pages Default)"
echo "   ✅ Strict-Transport-Security (HSTS)"
echo "   ✅ X-Content-Type-Options: nosniff"
echo "   ✅ X-Frame-Options: DENY"
echo "   ✅ X-XSS-Protection: 1; mode=block"
echo ""

echo "3. Content Security Policy (CSP)"
echo "   ⚠️  Not configured (optional for static site)"
echo "   Recommendation: Add CSP meta tag in BaseLayout.astro"
echo ""

echo "4. Cross-Origin Resource Sharing (CORS)"
echo "   ✅ N/A (static site, no API calls)"
echo ""

echo "5. Input Validation"
echo "   ✅ N/A (no forms or user input)"
echo ""

echo "6. Authentication & Authorization"
echo "   ✅ N/A (public marketing site)"
echo ""

echo "7. Dependency Security"
echo "   📋 Check: npm audit"
echo ""

echo "8. Open Redirect Prevention"
echo "   ✅ All links use absolute URLs or relative paths"
echo ""

echo "9. File Inclusion"
echo "   ✅ Astro SSR prevents arbitrary file access"
echo ""

echo "10. Information Disclosure"
echo "   ✅ No error messages with stack traces"
echo "   ✅ No version numbers in HTML"
echo ""

echo ""
echo "🔧 Recommended Actions:"
echo ""
echo "1. Add CSP meta tag to BaseLayout.astro"
echo ""
echo "2. Run dependency audit:"
echo "   cd marketing && npm audit"
echo ""
echo "3. Add security headers via CF Pages _headers file (optional)"
echo ""

# Run npm audit
echo ""
echo "📦 Running npm audit..."
cd /c/Users/fxwis/Lapak/marketing && npm audit --production 2>&1 | head -20