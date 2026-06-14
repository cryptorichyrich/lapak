## 17. AI Reseller Compliance & Legal

### Can We Legally Resell AI API Access?

**YES.** All major providers explicitly allow it. Key findings:

- **OpenAI** — You own all API outputs. Commercial use explicitly allowed. Cannot resell/redistribute API keys or Licensed Materials (SDKs). Copyright Shield (IP indemnification) only for Enterprise tier.
- **Google Gemini** — You own outputs. Indemnification for Enterprise customers against IP claims.
- **Anthropic** — You own outputs. Similar liability limitations.
- **Cloudflare Workers AI** — You own all inputs/outputs. CF doesn't use your data to train models. Models are third-party (open source) with their own licenses. Commercial use allowed.

**Legal pattern:** We're not "reselling the API" — we're selling a SERVICE that uses AI APIs as infrastructure. Same as a laundromat sells clean clothes, not washing machine access.

### Required Legal Documents

**Seller Terms of Service must include:**
- Disclose that content may be AI-generated
- Disclaim warranty on AI outputs (no guarantee of accuracy/originality)
- Require sellers to review AI content before publishing
- Limit liability to credit amount paid
- Right to switch AI providers without notice
- Prohibited use cases (illegal content, impersonation, spam)

**Privacy Policy must include:**
- AI providers as sub-processors (OpenAI, CF, Google)
- Data flow disclosure: Seller input → Lapak proxy → AI provider → back
- Data retention policies
- Sub-processor list with ability to update

**Indonesian compliance (UU PDP — Personal Data Protection):**
- Personal data processing consent from sellers
- Data localization: Supabase region = ap-southeast-1 (Singapore — acceptable under ASEAN framework)
- DPA (Data Processing Agreement) if processing EU data

**EU AI Act (if EU sellers use Lapak):**
- Article 50: Disclose when content is AI-generated
- Our use case = minimal risk (marketing copy, not medical/legal)
- Maintain documentation of AI systems used

### AI Credit System Policies

**Credit expiration:** Credits expire 12 months after purchase. Forces usage, prevents liability buildup.

**Credit packs (preliminary):**
- Starter: 50 credits — Rp25.000
- Standard: 200 credits — Rp75.000
- Pro: 500 credits — Rp150.000
- Free tier: 10 credits/month (non-cumulative, resets monthly)

**Refund policy:** No refunds on credits. One-time goodwill exceptions at our discretion.

**Credit values per task:**
- AI Copywriter (product description): 1 credit
- AI SEO Meta Tags: 1 credit
- AI Background Generation (product photo): 2 credits
- AI Page Generation (full landing page): 5 credits

### AI Rate Limiting & Abuse Prevention

Per-tenant rate limits to prevent abuse:

```
Rate limits (per tenant):
├── Free tier: 5 AI requests/hour, 10 credits/month
├── Starter: 20 AI requests/hour
├── Pro: 100 AI requests/hour
└── Burst: reject with 429 + "try again in X minutes"
```

**Content moderation:**
- All AI outputs filtered through provider safety settings (OpenAI moderation, CF safety filters)
- Indonesian-language content moderation for harmful/illegal content
- Seller can report inappropriate AI outputs
- We reserve right to revoke AI access for abuse

**Audit logging:**
- Every AI call logged: `{ tenant_id, task, model, tokens_in, tokens_out, credits_deducted, timestamp }`
- Seller can view usage history in Studio → AI Tools → Usage
- Monthly usage summary emailed to seller
- Console shows platform-wide AI usage analytics

### Billing Implementation (Simple D1/Supabase Approach)

No third-party billing platform needed at our scale:

```sql
-- Per-call deduction (atomic, race-condition safe)
UPDATE tenants
SET ai_credits_balance = ai_credits_balance - :cost
WHERE id = :tenant_id AND ai_credits_balance >= :cost
RETURNING ai_credits_balance;

-- If returns 0 rows → insufficient balance → reject request

-- Usage log (append-only)
INSERT INTO ai_usage_log (tenant_id, task, model, tokens_in, tokens_out, cost, created_at)
VALUES (:tenant_id, :task, :model, :tokens_in, :tokens_out, :cost, NOW());
```

---
