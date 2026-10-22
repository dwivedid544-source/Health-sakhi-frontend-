# Roles & Permissions

health sakhi uses a role-based frontend architecture to adjust access, dashboards, and navigation options according to the user's logged-in identity.

## Defined User Roles

| Role | Access Path | Description | Layout Style |
|---|---|---|---|
| **Member** (User) | `/app/*` | General consumers seeking health/mindfulness tools. | Top Navigation (Empathetic Glass) |
| **Advisor** (Coach) | `/advisor/*` | Certified wellness experts and doctors conducting sessions. | Left Sidebar (Slate Dark) |
| **Admin** (System) | `/admin/*` | Full system administrators managing CRUD and content. | Left Sidebar (Slate Dark) |
| **Partner** (Affiliate) | `/affiliate/*` | Growth collaborators generating referral signups. | Top Navigation (Empathetic Glass) |

---

## Permissions Grid & Access Control

### 1. Members (Free vs. Premium)
- **Free Plan:**
  - AI Chats: Capped at 5 messages per day. Message #6 prompts upgrade.
  - Advisor Consultations: Booking triggers block and displays Plan Upgrade screen.
  - Profile Status: Shows "Free Sakhi Member" with upgrade banner.
- **Premium Plan:**
  - AI Chats: Unlimited messaging.
  - Advisor Consultations: Access to slot scheduler page and active booking.
  - Profile Status: Shows "Premium Active" badge with download receipts enabled.

### 2. Advisors (Doctors & Coaches)
- View upcoming consultations queue.
- Conduct video/chat consultations with Members.
- Manage appointment calendars (Weekly grid slot manager).
- Track consultative performance and payouts/earnings logs.

### 3. Administrators (Admins)
- Full Member & Advisor CRUD operations (approve signups, suspend users).
- Content Management System (CMS) access to upload videos, create books, edit details.
- Billing and Subscription manager dashboard (receipt logs, payouts).
- View platform analytics charts (revenue logs, active users trend).

### 4. Partners (Affiliates)
- Generate UTM referral tracking links and QR codes.
- Track conversion statistics and pending/earned commission balances.
- Download marketing assets, banners, and digital kits.
