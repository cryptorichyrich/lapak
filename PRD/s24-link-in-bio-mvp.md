## 24. Link-in-Bio (MVP)

### What It Is

Every seller gets a `lapak.id/s/{shopname}` link-in-bio page — an Instagram/TikTok-friendly landing page with their key links.

### Content Model
```typescript
interface BioPage {
  shopname: string
  display_name: string
  avatar_url: string | null
  tagline: string | null
  theme_color: string | null       // override store theme
  links: {
    label: string
    url: string
    icon: 'store' | 'whatsapp' | 'instagram' | 'tiktok' | 'shopee' | 'tokopedia' | 'custom'
    is_active: boolean
  }[]
  social_links: {
    platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | 'whatsapp'
    url: string
  }[]
  featured_product_ids: string[]   // show up to 3 featured products
}
```

### Studio Editor
- Separate "Link-in-Bio" section in Studio sidebar
- Drag-to-reorder links
- Toggle links active/inactive
- Preview panel (phone mockup frame)
- Custom theme color picker

### Storefront Rendering
- Route: `lapak.id/s/{shopname}` (Astro SSR page)
- Mobile-first layout (99% traffic from mobile social)
- Avatar centered at top, display name, tagline
- Stacked link buttons with icons
- Social icons row
- Optional: 3 featured product cards at bottom
- Share button (copy URL to clipboard)
- OG meta tags for link preview (avatar + name + tagline)

### Sizing Estimate
- ~200 lines Astro page component
- ~150 lines Studio editor component
- ~50 lines API endpoint
- **Total: ~400 lines, 1-2 day build**

---
