## 14. AI Architecture

### AI Use Cases in Lapak

| Feature | AI Task | Input | Output |
|---|---|---|---|
| **AI Copywriter** | Generate product descriptions, marketing copy | Product name, category, keywords | Indonesian marketing text |
| **AI Photography** | Generate/edit product images | Product photo + style prompt | Enhanced product image |
| **SEO Auto-Pilot** | Auto-generate meta tags, schema, OG tags | Page/product data | Meta title, description, JSON-LD |
| **AI Page Gen** | Generate full page from description | Product + target buyer + copywriting framework | Block array (structured JSON) |
| **AI Rewrite** | Rewrite block content | Existing block text + instruction | Rewritten text |

### AI Provider Stack (Hybrid)

```
Seller AI Settings:
├── Mode: BYOK (bring your own key) OR Credits (buy from us)
│
├── BYOK mode:
│   ├── Seller pastes API key (OpenAI, Google, Fal.ai, etc.)
│   ├── Key stored encrypted in Supabase vault
│   ├── AI calls route through our proxy (never exposed to browser)
│   ├── No credits deducted, no markup
│   └── Supported: OpenAI, Google Gemini, Anthropic, Fal.ai
│
└── Credits mode:
    ├── Seller buys credit packs from us
    ├── We proxy to our provider keys (CF Workers AI default)
    ├── Per-call deduction from seller balance
    └── Balance visible in Studio dashboard
```

### Default Provider: Cloudflare Workers AI

| Model | Input/1M | Output/1M | Use Case |
|---|---|---|---|
| `ibm-granite-4.0-h-micro` | $0.017 | $0.112 | Bulk tasks (SEO tags, meta descriptions) |
| `meta/llama-3.2-1b-instruct` | $0.027 | $0.201 | Fast simple text (rewrite, summarize) |
| `qwen/qwen3-30b-a3b-fp8` | $0.051 | $0.335 | Quality text (copywriter, page gen) |
| `meta/llama-4-scout-17b-16e` | $0.270 | $0.850 | Complex tasks (long-form, reasoning) |
| `black-forest-labs/flux-1-schnell` | $0.00005/tile | — | Product photography (fast) |
| `black-forest-labs/flux-2-klein-4b` | $0.00006/tile | $0.00029/tile | Product photography (quality) |

**Free tier:** 10,000 Neurons/day (~$3.30/mo free). Covers early tenants at zero cost.

### External Provider Pricing (for BYOK reference)

| Provider | Model | Input/1M | Output/1M |
|---|---|---|---|
| Google | Gemini 2.0 Flash | $0.10 | $0.40 |
| OpenAI | GPT-4.1 nano | $0.10 | $0.40 |
| DeepSeek | V3 | $0.14 | $0.28 |
| Google | Gemini 2.5 Flash | $0.15 | $0.60 |
| OpenAI | GPT-4.1 mini | $0.40 | $1.60 |
| Meta (via Together) | Llama 4 Scout | $0.10 | $0.25 |

### AI Credits Pricing (2-3x markup on our cost)

| Pack | Credits | Price (IDR) | Approx calls |
|---|---|---|---|
| Starter | 50 | Rp 25.000 | ~50 copywriter / ~25 page gen |
| Standard | 200 | Rp 75.000 | ~200 copywriter / ~100 page gen |
| Pro | 500 | Rp 150.000 | ~500 copywriter / ~250 page gen |
| Image Add-on | 20 images | Rp 20.000 | 20 AI product photos |

**Credit costs:**
- Text generation (copywriter/SEO/rewrite): ~1 credit/call
- Page generation: ~2 credits/call (more tokens)
- Image generation: ~1 credit/image (our cost ~$0.0003, sell at Rp1.000)
- Free tier: 10 AI credits/month (teaser, auto-renews)

### AI Proxy Architecture

```
Studio AI request → CF Pages Function (/api/ai/*)
         ↓
Check seller AI mode:
├── BYOK → decrypt seller's key → proxy to their provider → return result
└── Credits → check balance → deduct credits → proxy to CF Workers AI → return result
         ↓
Response back to Studio
         ↓
Log usage to Supabase (audit trail + analytics)
```

**Security:** API keys NEVER exposed to browser. All AI calls go through our backend proxy.

### Hybrid AI Model Router (Intelligent Switching)

The router is the brain of our AI system. It abstracts away which provider/model actually runs — the seller never knows or cares. Same API, different backend routing.

```
┌─────────────────────────────────────────────────────┐
│                 AI Gateway Router                    │
│              (CF Pages Function)                     │
│                                                      │
│  Input: { task, prompt, mode, seller_id }            │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │ Mode Check  │──▶│ BYOK or      │                 │
│  │             │   │ Credits?     │                 │
│  └─────────────┘   └──────┬───────┘                 │
│                           │                          │
│         ┌─────────────────┼──────────────┐           │
│         ▼                 ▼              ▼           │
│   ┌───────────┐   ┌─────────────┐ ┌──────────┐     │
│   │  BYOK     │   │ Task Router │ │ Fallback │     │
│   │  Branch   │   │ (Credits)   │ │ Chain    │     │
│   └─────┬─────┘   └──────┬──────┘ └────┬─────┘     │
│         │                │              │            │
│         ▼                ▼              ▼            │
│   Seller's key     Model Selection   If primary     │
│   → their          by task type:     fails → try    │
│   provider         see table below   next provider  │
│                                                      │
│   Output: { result, model_used, credits_deducted }   │
└─────────────────────────────────────────────────────┘
```

**Task → Model Mapping (Credits mode):**

| Task | Primary Model | Cost/call | Fallback Model | Fallback Cost |
|---|---|---|---|---|
| SEO tags / meta desc | `granite-4.0-h-micro` | ~$0.00001 | `llama-3.2-1b` | ~$0.00002 |
| AI Rewrite (short) | `llama-3.2-1b-instruct` | ~$0.00002 | `granite-4.0` | ~$0.00001 |
| AI Copywriter (quality) | `qwen3-30b-a3b` | ~$0.00005 | `llama-4-scout` | ~$0.00027 |
| AI Page Gen (complex) | `llama-4-scout-17b` | ~$0.00027 | `qwen3-30b` | ~$0.00005 |
| AI Photography (fast) | `flux-1-schnell` | ~$0.00005 | `flux-2-klein` | ~$0.00006 |
| AI Photography (quality) | `flux-2-klein-4b` | ~$0.00006 | `flux-1-schnell` | ~$0.00005 |

**Fallback chain logic:**
```
1. Try primary model (cheapest for task)
2. If CF Workers AI returns error/timeout:
   a. Try fallback model (different arch, same infra)
   b. If still fails → try external provider (Gemini Flash via our key)
   c. If ALL fail → return error + refund credits
3. Log: { seller_id, task, primary_model, actual_model, latency, success }
```

**BYOK routing:**
```
1. Decrypt seller's stored key from Supabase vault
2. Detect provider from key prefix:
   - sk-... → OpenAI
   - AIza... → Google Gemini
   - sk-ant-... → Anthropic
   - fal-... → Fal.ai
3. Route to correct provider API
4. Transform request/response to our unified schema
5. No credits deducted, no markup
6. If seller's key is invalid → show "check your API key" error
```

**Unified response schema (same shape regardless of provider):**
```typescript
interface AIResponse {
  content: string;          // Text result (or base64 for images)
  model_used: string;       // e.g. "qwen3-30b-a3b-fp8" or "gpt-4.1-nano"
  provider: string;         // "cloudflare" | "openai" | "google" | "anthropic" | "fal"
  credits_deducted: number; // 0 for BYOK, 1-2 for credits
  latency_ms: number;       // Round-trip time
  tokens?: {                // Undefined for BYOK (we don't track their usage)
    input: number;
    output: number;
  };
}
```

**Key design principle:** Seller-facing API is ONE endpoint (`/api/ai/generate`). Task type + mode determine everything else. Zero config needed from seller perspective — they pick "Copywriter" and click Generate. Router handles the rest.

---
