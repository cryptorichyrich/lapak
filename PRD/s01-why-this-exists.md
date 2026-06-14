## 1. Why This Exists

**Problem:** Corpus was over-engineered. 4 CF services, env-swap deploy dance, KV quota crashes, git vs CLI confusion. Shitty admin. Shitty client dashboard. Nothing editable without a developer.

**Market gap (confirmed via live reverse engineering):** Djualan and pageflow.id exist but each does half the job:
- **pageflow.id** — beautiful block editor, instant publish, but NO e-commerce (no products, no cart, no checkout, no payments)
- **Djualan** (reverse-engineered 2026-06-12) — checkout + payments (Xendit) + shipping (5 regular + 3 instant couriers), AI-generated pages, 27 blocks, 9 templates with copywriting frameworks (PAS, AIDA, SCQA, PASTOR, BAB), BUT:
  - Still BETA ("Belum rilis resmi")
  - Only 8 quick themes, minimal color customization (3 colors)
  - No site navigation between sales pages
  - 5 image limit per product
  - Transfer Manual only for subscription payments
  - Single vertical block layout (no grid/flex)
  - No blog/content pages

**Nobody does both well** — a beautiful block-editor page builder WITH full e-commerce (products, cart, checkout, payments, order management) at a price Indonesian UMKM can afford.

**Lapak = Shopify simplicity + pageflow.id editor + Djualan's Indonesian payment focus — but better. Multi-page real ecommerce websites, not single-page landing pages.**

---
