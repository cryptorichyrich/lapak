# Multi-Tenant Auth Architecture Consultation

## Context

I'm building **Lapak** — an Indonesian e-commerce SaaS platform (like Shopify). Multiple sellers each get their own online store, all running on a **shared database** (Supabase/Postgres). One Supabase project, one `auth.users` table, one `public.users` table — tenants separated by `tenant_id`.

## Current Schema

```sql
-- Supabase Auth (managed, not editable by us)
CREATE TABLE auth.users (
  id    UUID PRIMARY KEY,
  email TEXT,  -- UNIQUE constraint (users_email_partial_key)
  encrypted_password TEXT,
  raw_app_meta_data  JSONB,
  raw_user_meta_data JSONB
);

-- Our application users table
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'seller' 
    CHECK (role IN ('owner','seller','platform_admin')),
  auth_user_id  UUID UNIQUE,  -- maps to auth.users.id
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)   -- same email OK in different tenants
);
```

## The Problem

Two constraints that conflict with multi-store buyer behavior:

1. **`auth.users` has `UNIQUE(email)`** — one email = one global account, one password. Cannot have different passwords per store.

2. **`public.users` has `UNIQUE(auth_user_id)`** — one auth account can only belong to ONE tenant row. A buyer registered at Store A cannot be a member of Store B.

## The Scenario

```
1. Andi (andi@gmail.com) registers at Toko Vavelle (Store A)
   → auth.users row created (email: andi@gmail.com, password: abc123)
   → public.users row created (tenant_id: A, auth_user_id: andi-uuid, role: buyer)
   ✅ Works fine

2. Andi visits Demo Shop (Store B), wants to buy something
   → Cannot register (email already exists in auth.users)
   → Can login with SAME password
   → BUT public.users only has row for Tenant A — no membership in Store B
   ❌ BLOCKED by UNIQUE(auth_user_id)

3. What if Andi resets password at Store C?
   → Changes password in auth.users
   → Password changes for ALL stores (shared auth account)
   → This is confusing for buyers who think each store is independent
```

## The Shopify Comparison

Shopify stores are **siloed** — each store has its own database/auth. Buyers register separately at each store with different passwords. This works for Shopify but feels outdated (like registering separately for every website in 2005).

Shopee/Tokopedia use **shared auth** — one account, buy from any seller. Better UX but they're marketplaces, not independent stores.

Lapak is a **hybrid** — each store looks independent (custom domain, own branding) but shares infrastructure.

## Proposed Fix

```sql
-- Drop global unique on auth_user_id
ALTER TABLE public.users DROP CONSTRAINT users_auth_user_id_key;

-- Add composite unique: same person can join multiple shops, once per shop
ALTER TABLE public.users ADD CONSTRAINT users_tenant_auth_unique 
  UNIQUE (tenant_id, auth_user_id);
```

Then update the `handle_new_user` trigger and JWT claims:
- Login detects which store (tenant) the user is on via domain/subdomain
- If `public.users` row exists for (tenant_id, auth_user_id) → use it
- If not → auto-create one with role=buyer
- JWT claims include current `tenant_id` so RLS policies work correctly

## Key Questions for Consultation

1. **Is shared auth the right call for a multi-tenant e-commerce SaaS?** Or should I accept the complexity of separate auth per store?

2. **The `UNIQUE(tenant_id, auth_user_id)` composite constraint** — any edge cases I'm missing? (e.g., a user who is an OWNER of Store A but a BUYER at Store B — role conflicts?)

3. **JWT claims problem:** Supabase RLS policies use `auth.uid()` from JWT. If Andi is browsing Store B, the JWT must contain Store B's tenant_id. But Andi might also be Store A's owner. How to handle "tenant context switching" in JWT claims cleanly?

4. **Security concerns:** With shared auth across stores, if one store gets compromised (XSS steals token), the attacker has access to ALL stores that user belongs to. Is this acceptable? Mitigation strategies?

5. **Buyer experience:** From a UX perspective, is "one account, shop anywhere" actually what Indonesian UMKM buyers expect? Or do they expect each store to be independent like real-life warungs?

6. **Alternative:** Should buyers NOT register at all? Guest checkout only (email + WhatsApp). No buyer accounts, no wishlist, no order history lookup. Simpler but no retention mechanism.

## Constraints

- **Must use Supabase Auth** — already built, RLS policies depend on it, 6 migrations applied
- **Single database** — not splitting into per-tenant databases
- **Indonesian market** — buyers are WhatsApp-native, price-sensitive, not tech-savvy
- **MVP timeline** — need to ship Phase 2 (storefront) in weeks, not months

## What I Need From You

A clear, opinionated recommendation with:
- Which approach to take (shared auth / siloed auth / guest-only / hybrid)
- Exact schema changes needed
- How to handle JWT tenant context
- Any gotchas I haven't considered
