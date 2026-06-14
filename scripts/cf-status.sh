#!/bin/bash
# CF API helper — uses CLOUDFLARE_API_TOKEN from .env
set -e

CF_T=$(grep CLOUDFLARE_API_TOKEN "$HOME/AppData/Local/hermes/.env" | cut -d= -f2)
ACCT="09dabe15db11e2f59e97c9807c18cf73"
API="https://api.cloudflare.com/client/v4"
AUTH="Authorization: Bearer $CF_T"

echo "=== Verify Token ==="
curl -sf -H "$AUTH" "$API/user/tokens/verify" | python3 -m json.tool | head -6

echo ""
echo "=== Pages Projects ==="
curl -sf -H "$AUTH" "$API/accounts/$ACCT/pages/projects" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    for p in d.get('result',[]):
        print(f\"  {p['name']:25s} subdomain={p.get('subdomain','?')}  branch={p.get('production_branch','?')}\")
    print(f'  Total: {len(d[\"result\"])} projects')
else:
    print('  Error:', d.get('errors',[{}])[0].get('message','?'))
"

echo ""
echo "=== Workers Routes ==="
curl -sf -H "$AUTH" "$API/accounts/$ACCT/workers/scripts" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    for w in d.get('result',[]):
        print(f\"  {w.get('id','?')}\")
else:
    print('  Error:', d.get('errors',[{}])[0].get('message','?'))
"

echo ""
echo "=== KV Namespaces ==="
curl -sf -H "$AUTH" "$API/accounts/$ACCT/storage/kv/namespaces" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    for ns in d.get('result',[]):
        print(f\"  {ns['title']:25s} id={ns['id']}\")
    print(f'  Total: {len(d[\"result\"])} namespaces')
else:
    print('  Error:', d.get('errors',[{}])[0].get('message','?'))
"

echo ""
echo "=== R2 Buckets ==="
curl -sf -H "$AUTH" "$API/accounts/$ACCT/r2/buckets" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    for b in d.get('result',{}).get('buckets',[]):
        print(f\"  {b.get('name','?')}\")
else:
    print('  Error:', d.get('errors',[{}])[0].get('message','?'))
"

echo ""
echo "=== D1 Databases ==="
curl -sf -H "$AUTH" "$API/accounts/$ACCT/d1/database" | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    for db in d.get('result',[]):
        print(f\"  {db.get('name','?'):25s} id={db.get('uuid','?')}\")
else:
    print('  Error:', d.get('errors',[{}])[0].get('message','?'))
"
