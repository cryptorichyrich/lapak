## 16. Image Storage & Processing

### Storage: Cloudflare R2 (Zero Egress)

All tenant images stored in **Cloudflare R2** — same CF account as Pages + KV + Workers AI.

| Metric | Cost |
|---|---|
| Storage | $0.015/GB/month |
| Egress | **$0** (zero, unlimited) |
| Class A ops (write/delete) | $4.50/million |
| Class B ops (read) | $0.36/million |
| Free tier | 10GB + 10M Class B/month |

**Why R2 (not S3/Supabase Storage/Backblaze B2):**
- Zero egress = serve unlimited product images with zero bandwidth bill
- Same infra as Pages + KV + Workers AI = zero integration complexity
- S3-compatible API for easy future migration
- 10GB free covers first ~100 tenants (avg 100MB each)
- Backblaze B2 is cheaper storage ($0.006 vs $0.015) but needs CF in front + extra integration. Not worth saving $0.009/GB at our scale.

**R2 bucket structure:**
```
lapak-assets/
├── tenants/{tenant_id}/
│   ├── products/{product_id}/
│   │   ├── original.webp      # uploaded image
│   │   ├── thumb_300.webp     # CF Images transform
│   │   └── thumb_600.webp     # CF Images transform
│   ├── blog/{post_id}/
│   ├── logo.webp
│   ├── favicon.ico
│   └── og-image.webp
```

### Background Removal: Cloudflare Images API (Built-in)

**No AI credits needed.** CF Images API has native background removal:

```
shopname.lapak.id/cdn-cgi/image/segment=foreground,background=white/product-photo.webp
```

One URL parameter = instant white-background product photo. CF runs **BiRefNet** (state-of-art segmentation model) on their GPUs. Available on Free and Paid CF plans.

**AI Photography pipeline:**
1. Seller uploads raw photo → R2
2. CF Images auto-removes background (`segment=foreground`)
3. Optional: AI generates new background (flux model) → composites ← THIS costs credits
4. Serve optimized WebP via CF CDN

**Simple background removal = free.** AI-generated backgrounds = credits.

### Image Optimization

All images served through CF Images transformations:
- Auto WebP/AVIF format negotiation
- Responsive sizes (300px, 600px, 1200px)
- Face-aware cropping (`gravity=face`)
- Background removal (`segment=foreground`)
- Solid color fill (`background=white`)

---
