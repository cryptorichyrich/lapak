## 21. Notification System

### MVP: Push + Email (no SMS in MVP)

**How sellers get instant order alerts:**

| Channel | Mechanism | Latency |
|---|---|---|
| **Studio push** | Realtime subscription via Supabase Realtime on `orders` table | <1s |
| **Email** | Immediate send via unemail (New Order template) | <5s |
| **WhatsApp** (v2) | Automated message via WA Business API | v2 |

**Supabase Realtime setup:**
```sql
-- Enable Realtime on orders table
alter publication supabase_realtime add table orders;
```

Studio subscribes to INSERT events on `orders` where `tenant_id = current_tenant`. On insert → browser notification (if permission granted) + sound + toast.

### Buyer Notifications

| Event | Channel | Content |
|---|---|---|
| Order confirmed | Email | Order summary, estimated delivery |
| Order shipped | Email | Tracking number, courier name |
| Order delivered | Email | Review request + link |

### Future (v2+)
- WhatsApp Business API for order alerts (seller) + shipping updates (buyer)
- In-app notification center with bell icon
- Push notification for mobile (PWA)

---
