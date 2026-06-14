## 18. Open Risks

| Risk | Mitigation |
|---|---|
| CF Pages cold start latency for SSR | Edge caching (15min TTL) means most requests are cache hits. Cold starts ~50ms at CF edge. |
| CF Workers AI model quality for Indonesian | Test with Indonesian prompts. Fallback to external providers (Gemini Flash $0.10/1M). BYOK option covers quality needs. |
| Supabase free tier too small for production | Upgrade to Pro ($25/mo) when we have paying tenants |
| Xendit Owned sub-accounts disabled for Indonesia | Contact Xendit support to enable, or use Managed sub-accounts (tenant gets dashboard) |
| Everpro API access restrictions or limited docs | Fallback to RajaOngkir/Komerce API V2 (same courier coverage, well-documented) |
| Regulatory: holding tenant funds via Xendit sub-accounts | Xendit handles compliance. Use Managed sub-accounts so tenants control own funds. |
| Free users never convert | Strong upgrade funnel: checkout preview in editor, "upgrade to sell" CTAs, 10 free AI credits/month |
| BYOK sellers bypass credit revenue | BYOK = zero cost for us. Credits target users who don't want API management. Both drive platform stickiness. |
| Custom domain setup too technical for UMKM | Step-by-step guide with screenshots. Auto-detect CNAME status. Email-based onboarding for paid plans. |

---
