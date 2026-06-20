# Lapak — Performance Audit
> Task 5.13 | Lighthouse 90+ target

## Target Scores
| Metric | Target | Mobile | Desktop |
|--------|--------|--------|---------|
| Performance | ≥ 90 | 90+ | 95+ |
| Accessibility | ≥ 90 | 90+ | 95+ |
| Best Practices | ≥ 95 | 95+ | 95+ |
| SEO | ≥ 95 | 95+ | 100 |

## Core Web Vitals
| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (Time to First Byte) | < 800ms |

## Pages to Audit
1. **Storefront Homepage** — https://lapak-storefront.fxwisdom1.workers.dev
2. **Product Detail** — produk dengan 3+ gambar
3. **Checkout Page** — dengan ringkasan pesanan
4. **Studio Dashboard** — https://lapak-studio.pages.dev

## Optimizations Applied
- ✅ WebP/AVIF images with lazy loading
- ✅ `font-display: swap` for custom fonts
- ✅ CSS critical path inlined
- ✅ `aspect-ratio` declared on images (CLS prevention)
- ✅ CF Workers edge caching
- ✅ `prefers-reduced-motion` respected

## Monitoring
- Lighthouse CI integrated via GitHub Actions
- Weekly automated audit via scheduled cron
- Regression alert if score drops below 85
