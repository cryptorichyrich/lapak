# E2E Smoke Test Checklist

## Phase 5.11 — E2E Smoke Tests

### Test Flow
signup → onboarding → product → publish → browse → cart → checkout → sandbox → webhook → order → ship

### Test Cases

#### 1. Signup Flow
- [ ] Navigate to `/signup`
- [ ] Fill email, password
- [ ] Complete 4-step onboarding:
  - [ ] Store name
  - [ ] Category selection
  - [ ] Contact info (WA, email, city)
  - [ ] Theme selection
- [ ] Verify tenant created in DB
- [ ] Verify tenant status = 'active'
- [ ] Verify plan = 'free'

#### 2. Onboarding Skip Product
- [ ] Click "Skip" on first product step
- [ ] Redirect to Dashboard
- [ ] Verify dashboard loads with 0 products

#### 3. Add Product
- [ ] Navigate to Products page
- [ ] Click "Add Product"
- [ ] Fill product details:
  - [ ] Name
  - [ ] Description
  - [ ] Price
  - [ ] Category
  - [ ] Upload image (R2)
- [ ] Save product
- [ ] Verify product appears in list
- [ ] Verify product status = 'draft'

#### 4. Publish Product
- [ ] Edit product
- [ ] Set status = 'published'
- [ ] Save
- [ ] Verify status changes to 'published'

#### 5. Browse Storefront (Buyer)
- [ ] Open storefront in new tab (different tenant slug)
- [ ] Navigate to `/products`
- [ ] Verify product appears in catalog
- [ ] Click product detail
- [ ] Verify detail page loads
- [ ] Verify image, price, variants display

#### 6. Add to Cart
- [ ] Click "Beli Sekarang" or add variant
- [ ] Verify cart drawer opens
- [ ] Verify item in cart
- [ ] Verify price correct

#### 7. Checkout
- [ ] Click "Checkout"
- [ ] Navigate to checkout page
- [ ] Verify cart items shown
- [ ] Fill shipping address:
  - [ ] Name, phone
  - [ ] Address, city
  - [ ] Postal code
- [ ] Select shipping method (Everpro)
- [ ] Verify rate displayed
- [ ] Select payment method (Xendit)
- [ ] Click "Pay"
- [ ] Verify redirected to Xendit Invoice

#### 8. Xendit Sandbox Payment
- [ ] Use sandbox credentials
- [ ] Complete payment
- [ ] Verify redirect back to storefront
- [ ] Verify order created in DB
- [ ] Verify order status = 'paid'
- [ ] Verify payment_url set
- [ ] Verify xendit_invoice_id set

#### 9. Webhook Handler
- [ ] Xendit sends PAID webhook
- [ ] Verify webhook signature validated
- [ ] Verify order status updated to 'confirmed'
- [ ] Verify email notification sent (Resend)
- [ ] Verify WA notification sent (if configured)

#### 10. Seller Dashboard
- [ ] Login as seller
- [ ] Navigate to Orders page
- [ ] Verify new order appears
- [ ] Verify order details correct:
  - [ ] Items, quantities
  - [ ] Total, shipping cost
  - [ ] Buyer info
  - [ ] Payment status
- [ ] Verify order status = 'confirmed'

#### 11. Create Shipment
- [ ] Click "Create Shipment"
- [ ] Select courier (Everpro)
- [ ] Verify tracking number returned
- [ ] Verify order status = 'shipped'
- [ ] Verify shipped_at set
- [ ] Verify tracking_number set

#### 12. Buyer Tracking
- [ ] Login as buyer
- [ ] Navigate to `/track/{token}`
- [ ] Verify order status shows 'shipped'
- [ ] Verify tracking number displayed
- [ ] Verify courier info shown

### Critical Failures (Block Launch)
| Test | Failure Impact |
|------|----------------|
| Signup | Can't create tenant — blocked |
| Onboarding | Can't activate store — blocked |
| Product CRUD | Can't sell — blocked |
| Storefront browse | Buyer can't see products — blocked |
| Cart | Buyer can't checkout — blocked |
| Xendit checkout | Can't process payments — blocked |
| Webhook | Orders don't confirm — blocked |
| Shipment creation | Can't ship — blocked |

### Test Environment
- **Supabase:** Local (via docker-compose) or staging
- **Xendit:** Sandbox API keys
- **Everpro:** Sandbox API keys
- **Resend:** Sandbox mode

### Test Data
- **Test buyer:** test-buyer@example.com / Password123!
- **Test seller:** test-seller@example.com / Password123!
- **Test products:** 3 products (different categories)
- **Test shipping:** Jakarta origin, Bandung destination

### Execution Commands
```bash
# Manual test flow
open http://localhost:4321/signup
# Follow manual steps above

# API test (check DB)
curl http://localhost:8787/api/health
curl -H "Authorization: Bearer <JWT>" http://localhost:8787/api/console/tenants
```

### Success Criteria
✅ All 12 test cases pass
✅ No console errors
✅ All API endpoints return 200/201
✅ DB state matches expectations at each step
✅ Email/WA notifications sent (verified in Resend/WA logs)