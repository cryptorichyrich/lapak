#!/bin/bash
# Add API_SERVER vars to hermes .env
ENVFILE="/c/Users/fxwis/AppData/Local/hermes/.env"
TMPFILE="/tmp/hermes-env-patch.txt"

# Read existing, check if API_SERVER vars exist
if grep -q "API_SERVER_ENABLED" "$ENVFILE" 2>/dev/null; then
  echo "API_SERVER vars already in .env"
  exit 0
fi

# Append the vars
cat >> "$ENVFILE" << 'ENVEOF'

# =============================================================================
# API SERVER (Hermes PM App)
# =============================================================================
API_SERVER_ENABLED=true
API_SERVER_KEY=lapak-hm-2026-secure
API_SERVER_CORS_ORIGINS=*
ENVEOF

echo "Added API_SERVER vars to .env"
grep "API_SERVER" "$ENVFILE"
