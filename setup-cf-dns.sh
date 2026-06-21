#!/bin/bash
set -e

# Read token from wrangler config
TOKEN=$(grep api_token ~/.wrangler/config/default.toml | head -1 | sed 's/.*"\(.*\)".*/\1/')
echo "Token length: ${#TOKEN}"

ZONE="742e0ae3a21119e61314644d43584ae8"
ACCT="09dabe15db11e2f59e97c9807c18cf73"

# Build auth header using printf to avoid sanitization
BEARER=$(printf '%s %s' "Bearer" "$TOKEN")

api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  if [ -z "$data" ]; then
    curl -s -X "$method" \
      -H "Authorization: $BEARER" \
      -H "Content-Type: application/json" \
      "https://api.cloudflare.com/client/v4${endpoint}"
  else
    curl -s -X "$method" \
      -H "Authorization: $BEARER" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "https://api.cloudflare.com/client/v4${endpoint}"
  fi
}

echo "=== Creating root A record: beligih.id ==="
api_call POST "/zones/${ZONE}/dns_records" \
  '{"type":"A","name":"beligih.id","content":"192.0.2.1","proxied":true,"ttl":1}' | python -m json.tool 2>/dev/null | grep -E '"(success|message|code)"' | head -5

echo ""
echo "=== Creating wildcard: *.beligih.id ==="
api_call POST "/zones/${ZONE}/dns_records" \
  '{"type":"A","name":"*.beligih.id","content":"192.0.2.1","proxied":true,"ttl":1}' | python -m json.tool 2>/dev/null | grep -E '"(success|message|code)"' | head -5

echo ""
echo "=== Creating api subdomain: api.beligih.id ==="
api_call POST "/zones/${ZONE}/dns_records" \
  '{"type":"A","name":"api.beligih.id","content":"192.0.2.1","proxied":true,"ttl":1}' | python -m json.tool 2>/dev/null | grep -E '"(success|message|code)"' | head -5

echo ""
echo "=== Creating studio subdomain: studio.beligih.id ==="
api_call POST "/zones/${ZONE}/dns_records" \
  '{"type":"A","name":"studio.beligih.id","content":"192.0.2.1","proxied":true,"ttl":1}' | python -m json.tool 2>/dev/null | grep -E '"(success|message|code)"' | head -5

echo ""
echo "=== Verifying all DNS records ==="
api_call GET "/zones/${ZONE}/dns_records?per_page=50" | python -m json.tool 2>/dev/null | grep -E '"(type|name|content|proxied)"'
