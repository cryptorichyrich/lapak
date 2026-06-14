## 19. Seller Onboarding Flow

### First-Run Experience (FRX)

When a new seller signs up, they land on a guided 4-step onboarding wizard:

**Step 1 — Store Identity** (required)
- Store name (becomes subdomain: `shopname.lapak.id`)
- Tagline (optional)
- Logo upload (optional, skip for now)
- Category selection (pick from 10 preset categories: Fashion, Food, Craft, Beauty, Electronics, Home, Sports, Services, Digital, Other)

**Step 2 — Contact & WhatsApp** (required)
- WhatsApp number (for order notifications + buyer contact)
- Email address
- City (for shipping origin)

**Step 3 — Choose Theme** (required)
- 5 pre-made themes displayed as visual cards
- Each theme = complete token set (colors, typography, spacing, glass)
- Click to preview on dummy store
- Can change anytime in Studio → Appearance

**Step 4 — First Product or Skip** (optional)
- Quick-add form: name, price, photo, description
- OR "I'll add products later" → skip
- If skip: store shows a "Coming Soon" page with logo + tagline + WA button

### Empty Store UX

- When store has 0 published products/pages, show "Coming Soon" landing page (not 404)
- Coming Soon = Hero block with store name + tagline + WA button + "Follow us" social links
- Studio dashboard shows "Getting Started" checklist:
  - ✅ Store created
  - ☐ Add your first product
  - ☐ Create your first page
  - ☐ Connect WhatsApp
  - ☐ Share your store link
- Each checklist item = deep link to the relevant Studio section

### Onboarding Templates (MVP — 5 starter page templates)

Pre-built page layouts sellers can 1-click apply:

1. **Fashion Store** — Hero + Product Grid + Testimonials + Contact
2. **Food & Beverage** — Hero + Menu Cards + Reviews + WA Order
3. **Craft & Handmade** — Story + Gallery Grid + Products + About
4. **Services** — Hero + Pricing Cards + Portfolio + Booking (WA)
5. **General** — Hero + Products + FAQ + Contact

Each template = pre-filled block array with placeholder content. Seller edits text/images.

---
