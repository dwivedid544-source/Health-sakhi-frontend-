# HealthSakhi — Wireframe Document
**Tech:** Vite + React + TailwindCSS v4 + Framer Motion  
**Roles:** Member | Admin | Advisor | Affiliate  
**Total Screens:** 47

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Primary | #ff69b4 | CTAs, active states, accents |
| Dark | #2D1520 | Headings, Sidebar, High-contrast text |
| Muted | #C4A0AC | Labels, tertiary text |
| Background | Mesh Gradient | #ff69b4/5 + #FFF1F2 (Glassmorphism) |
| Border | #F5E6EA | Rose-tinted glass borders |
| Typography| Outfit / Plus Jakarta | Modern, Bold, Premium font pairing |
| Interactive| Framer Motion | Smooth transitions, Hover scales, Soft fades |

---

## Navigation Flow

```
Landing (/) → Login (/login) → OTP (/otp)
                  │
     ┌────────────┼────────────┬──────────┐
     ↓            ↓            ↓          ↓
  Member       Advisor       Admin     Partner
  /app         /advisor      /admin    /affiliate
```

---

## 1. AUTH SCREENS

### Landing Page  `/`
```
[ NAVBAR: Logo | Home Features Journey Pricing Stories | Start Button ]
──────────────────────────────────────────────────────────────────────
[ HERO ]
  Left: Badge | H1 Title | Mood Chips | CTA Buttons | Stats
  Right: Hero Image + Glass Badges (Streak, AI Says)

[ FEATURES ] - 15 cards (3-col grid)
  Each: Image + Icon + Title + Description

[ JOURNEY ] - 4 step cards
  01 Create → 02 Explore → 03 Heal → 04 Celebrate

[ DEMO ] - Video player with play/pause

[ PRICING ] - 3 tiers
  Free | Premium (₹499/mo) | Elite (₹999/mo)

[ TESTIMONIALS ] - Auto-rotating carousel + avatar nav

[ CTA ] - Full-width bg image + "YOU DESERVE TO HEAL"

[ FOOTER ] - Brand | Links | Contact | Newsletter
```

### Login  `/login`
```
┌─────────────────────────┐
│   ❤️  HealthSakhi       │
│   Trusted Companion     │
│                         │
│ [Member|Advisor|Admin   │
│  |Partner] tabs         │
│                         │
│ ┌─────────────────┐     │
│ │  Email Address  │     │
│ └─────────────────┘     │
│                         │
│ [ ACCESS PORTAL → ]     │
└─────────────────────────┘
```

### OTP  `/otp`
```
┌─────────────────────────┐
│  🔒 Verification        │
│  [_][_][_][_][_][_]     │
│  [ UNLOCK ACCESS ]      │
│  Resend in 0:30         │
└─────────────────────────┘
```

---

## 2. MEMBER APP — Layout

```
┌─────────────────────────────────────────────────────┐
│ Logo | Home Explore Learning Books AI Sakhi Session │
│                                          🔔 [Avatar]│
├─────────────────────────────────────────────────────┤
│ Meditation|Wealth|ToDo|Budget|Affirm|Mental|Love... │
├─────────────────────────────────────────────────────┤
│                   PAGE CONTENT                      │
└─────────────────────────────────────────────────────┘
```

### Home  `/app`
```
┌──────────────────────────────┬─────────────────┐
│ Namaste, Sakhi 🌸            │ [Streak][Vitaly] │
│ Thursday, 23 April           │  12 Days  85%   │
│                              │                 │
│ INTERNAL RESONANCE           │ UPCOMING FOCUS  │
│ [😊][😢][🌙][⚡][❤️][🔋]  │ □ Morning Yoga  │
│                              │ □ Finance Review│
│ NEURAL PATHWAYS       [<][>] │ □ Affirmation  │
│ [Women Health][Heart Care]   │                 │
│ [Mental Healing]             │ DAILY RITUALS   │
│                              │ □ Hydration     │
│ CURATED FOR YOU           →  │ □ Breathing     │
│ ┌─vid─┐┌─vid─┐┌─vid─┐      │ □ Log Mood      │
│ │ tag ││ tag ││ tag │       │ □ Reading       │
│ │name ││name ││name │       │                 │
│ └─────┘└─────┘└─────┘      │ DEEP PROCESSING │
│                              │ Video  ▓▓▓░ 65%│
│                              │ Book   ▓░░░ 30%│
│                              │                 │
│                              │ ✨ Need talk?   │
│                              │ [Open AI →]     │
└──────────────────────────────┴─────────────────┘
```

### Profile  `/app/profile`
```
┌─────────────────────────────────────────┐
│ [Avatar] Name 🌸      [Edit Profile]   │
│ Premium Member                          │
│ 📧 email  📱 phone                    │
│ Bio...                                  │
│                                         │
│ [Wellness 72%] [Sessions 18] [Done 5] │
│                                         │
│ ┌── Annual Wellness Pass 💎 ─────────┐ │
│ │ ⭐ Premium Active - April 2027     │ │
│ │ [Manage Plan]   [Receipts]         │ │
│ └────────────────────────────────────┘ │
│                                         │
│ [Saved 12]  [History 24d]              │
│ [Mood]      [Billing Active]           │
│                                         │
│ [─── Sign Out ───]                     │
└─────────────────────────────────────────┘
```

### AI Sakhi Chat  `/app/ai-sakhi`
```
┌─────────────────────────────────────────┐
│ ✨ AI Sakhi Chat         ● Always Active│
├─────────────────────────────────────────┤
│ [ Viewport: h-[calc(100vh-160px)] ]     │
│                                         │
│ ┌── Sakhi ──────────────────────────┐  │
│ │ Caring & Friend-like tone 🌸      │  │
│ └────────────────────────────────────┘  │
│                                         │
│      ┌── User ───────────────────────┐ │
│      │ Fixed floating input bar      │ │
│      └────────────────────────────────┘│
├─────────────────────────────────────────┤
│ [Anxious 😟][Irregular 🌙][Stress 🌿] │
│ ┌─────────────────────────────┐ [🎤]  │
│ │ Type your message...        │ [→]   │
│ └─────────────────────────────┘       │
│         🔒 Private & Secure           │
└─────────────────────────────────────────┘
```

### Meditation  `/app/meditation`
```
┌─────────────────────────────────────────┐
│ 🧘 Meditation Sakhi                    │
│ [Sleep] [Focus] [Anxiety] [Morning]    │
│                                         │
│ ┌── Now Playing ─────────────────────┐ │
│ │ ▶ Inner Calm Session               │ │
│ │ ━━━━━━━━━━━░░░░░░  04:12 / 12:00  │ │
│ │ [⏮]  [⏸]  [⏭]    🔊             │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌────┐ ┌────┐ ┌────┐  Session cards   │
│ │ 🌙 │ │ 🎯 │ │ 💆 │                 │
│ └────┘ └────┘ └────┘                  │
│                                         │
│ Timer: [5 min][10 min][15 min][20 min] │
└─────────────────────────────────────────┘
```

### Book Library  `/app/books`
```
┌─────────────────────────────────────────┐
│ 📚 Healing Library       [Search...]   │
│                                         │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │[Cover]│ │[Cover]│ │[Cover]│ │[Cover]│  │
│ │      │ │      │ │      │ │      │  │
│ │Title │ │Title │ │Title │ │Title │  │
│ │▓▓▓░░ │ │▓░░░░ │ │▓▓▓▓░ │ │ New  │  │
│ │  65% │ │  30% │ │  80% │ │      │  │
│ └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

### Session Booking  `/app/sessions`
```
┌─────────────────────────────────────────┐
│ ✨ Book your 15-min Sakhi session       │
│ ✓ 100% Private   ✓ Expert Led          │
│                                         │
│ OUR WELLNESS ADVISORS                   │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ [Photo]          │ │ [Photo]       │ │
│ │ Dr. Sakshi       │ │ Advisor Name  │ │
│ │ ⭐ 4.9 (840)     │ │ ⭐ 4.8 (520)  │ │
│ │ [PCOD][Thyroid]  │ │ [Gut][Diet]   │ │
│ │ [Select & Book→] │ │ [Select & Book→]│
│ └──────────────────┘ └───────────────┘ │
│                                         │
│ 📅 SELECT YOUR SLOT                    │
│ [10:00][10:30][11:00][11:30]           │
│ [14:00][14:30][15:00][15:30]           │
└─────────────────────────────────────────┘
```

### Affirmation  `/app/affirmation`
```
┌─────────────────────────────────────────┐
│ ✨ Daily Affirmations                   │
│                                         │
│ ┌── Today's Card ──────────────────┐   │
│ │ "I am worthy of love and         │   │
│ │  healing. I choose peace." 🌸    │   │
│ │  [❤️ Save]  [📤 Share]  [→ Next] │   │
│ └────────────────────────────────────┘  │
│                                         │
│ Categories:                             │
│ [Self-Love][Health][Confidence]        │
│ [Gratitude][Strength]                  │
│                                         │
│ My Saved Affirmations...               │
└─────────────────────────────────────────┘
```

### Mood Screen  `/app/mood/:type`
```
┌─────────────────────────────────────────┐
│ ← Back    You feel: STRESSED ⚡        │
│                                         │
│ ┌── Guided Exercise ────────────────┐  │
│ │ 4-7-8 Breathing Technique         │  │
│ │ [Start Timer]                     │  │
│ └────────────────────────────────────┘ │
│                                         │
│ Recommended for you:                    │
│ [Video: Anxiety Relief 10min]          │
│ [Book: Inner Healing Guide]            │
└─────────────────────────────────────────┘
```

### Finance / Home Budget  `/app/finance`
```
┌─────────────────────────────────────────┐
│ 💳 Home Budget Sakhi    [Export PDF]   │
│                                         │
│ Income: ₹50,000   Spent: ₹32,400      │
│ Saved:  ₹17,600                        │
│                                         │
│ [Pie Chart - spending categories]      │
│                                         │
│ TRANSACTIONS                [Add +]    │
│ ┌─────────────────────────────────┐    │
│ │ 🛒 Groceries   ₹2,400   Apr 22 │    │
│ │ 💊 Medicine    ₹800     Apr 21 │    │
│ │ 🎓 Course      ₹499     Apr 20 │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### To-Do  `/app/todo`
```
┌─────────────────────────────────────────┐
│ ✅ My To-Do List              [Add +]  │
│ [All][Today][Health][Work][Personal]   │
│                                         │
│ TODAY                                   │
│ ☑ Morning Yoga Session    09:00 AM    │
│ ☑ Take medication         10:00 AM    │
│ ○ Finance Review          02:00 PM    │
│ ○ Evening Walk            06:00 PM    │
│                                         │
│ UPCOMING                               │
│ ○ Book advisor session                │
│ ○ Weekly meal planning                │
└─────────────────────────────────────────┘
```

### Other Member Screens (Summary)

| Screen | Route | Key UI |
|---|---|---|
| Book Detail | `/app/books/:id` | Cover, synopsis, chapters, progress, CTA |
| Book Reader | `/app/books/:id/read` | Text reader, audio mode, quiz |
| Video | via Explore | Player, notes panel, Sakhi chat |
| Explore | `/app/explore` | Search, accordion modules, playlists |
| Learning | `/app/learning` | Course progress, recommendations |
| Love Sakhi | `/app/relationship` | Relationship tips, exercises |
| Mental Health | `/app/mental-health` | Assessment, coping tools |
| Grooming | `/app/grooming` | Self-care routines, tips |
| Spiritual | `/app/spiritual` | Gita wisdom, mantras |
| Wealth | `/app/wealth` | Goals, investment guidance |

---

## 3. ADMIN PANEL — Layout

```
┌────────┬────────────────────────────────────┐
│ SIDEBAR│ HEADER: Page Title    🔔  [User]  │
│        ├────────────────────────────────────┤
│ Logo   │                                    │
│ Dash   │          PAGE CONTENT              │
│ Users  │                                    │
│ Content│                                    │
│ Books  │                                    │
│ Advise │                                    │
│ Appts  │                                    │
│ Plans  │                                    │
│ Pay    │                                    │
│ Sakhi  │                                    │
│ Analyt │                                    │
│ Camp   │                                    │
│ ──────│                                    │
│ Logout │                                    │
└────────┴────────────────────────────────────┘
```

### Admin Dashboard  `/admin`
```
┌─────────────────────────────────────────────┐
│ [Users 12,482 +12%] [Paid 4,215 +8%]       │
│ [Revenue ₹3.79L +15%] [Active 156 -2%]     │
├─────────────────────┬───────────────────────┤
│  USER GROWTH (Bar)  │  REVENUE TREND (Line)  │
│  ▁▃▂▆▅▇▅█▉██      │  ╱╲ ╱╲╱╲ ╱╲╱         │
│  J F M A M J J A S │  J F M A M J J A S    │
├─────────────────────┼───────────────────────┤
│  TOP CONTENT        │  RECENT REVENUE        │
│  ▓▓▓▓▓▓▓▓ 2.5k    │  Priya  ₹8,999  ✅    │
│  ▓▓▓▓░░░░ 1.8k    │  Anjali ₹999    ✅    │
│  ▓▓▓░░░░░ 1.2k    │  Divya  ₹8,999  ✅    │
│  ▓▓░░░░░░  950     │  Kavya  ₹999    ⏳    │
└─────────────────────┴───────────────────────┘
```

### User Management  `/admin/users`
```
┌─────────────────────────────────────────────┐
│ User Management         [Search] [+ Add]   │
│ [All][Active][Premium][Free][Suspended]     │
├──────────┬──────────────┬────────┬─────────┤
│ Name     │ Email        │ Plan   │ Status  │
├──────────┼──────────────┼────────┼─────────┤
│ Priya S. │ p@gmail.com  │ Annual │ ✅ Active│
│ Anjali M.│ a@gmail.com  │ Free   │ ✅ Active│
│ Divya N. │ d@gmail.com  │ Monthly│ ⏸ Paused│
├──────────┴──────────────┴────────┴─────────┤
│ [← Prev]    Page 1 of 12    [Next →]       │
└─────────────────────────────────────────────┘
```

### Admin Screens Summary

| Screen | Route | Key UI |
|---|---|---|
| Advisor Mgmt | `/admin/advisors` | Table, approval status, specialties |
| Appointments | `/admin/appointments` | Calendar, filters, advisor assign |
| Payments | `/admin/payments` | Transaction log, refunds |
| Campaigns | `/admin/notifications` | Push/email, schedule |
| Plan Mgmt | `/admin/plans` | Tier editor, feature toggles |
| Analytics | `/admin/analytics` | Charts, demographics |
| Content CMS | `/admin/content` | Video/article publish |
| Sakhi CMS | `/admin/sakhi-cms` | AI templates, flows |
| Book CMS | `/admin/books` | Library, reader insights |
| Add Book | `/admin/books/add` | Multi-step: cover, chapters, quiz |

---

## 4. ADVISOR PANEL — Layout

Same sidebar layout as Admin (dark `bg-slate-900` sidebar)

### Advisor Dashboard  `/advisor`
```
┌─────────────────────────────────────────────┐
│ [Patients 42] [Sessions 156]               │
│ [Rating 4.9★] [Earnings ₹45,200]          │
├─────────────────────────────────────────────┤
│ LIVE TELE-HEALTH QUEUE                      │
│ ┌─────────────────────────────────────┐    │
│ │ 🕙 10:30 AM — Priya S.              │    │
│ │ 🩺 [Day 14 - High Fertility]        │    │
│ │ [ Join Session → ]                  │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ PERFORMANCE SNAPSHOT (Bars)                 │
│ ▓▓▓▓▓▓▓▓▓░ 98% Satisfaction                │
│ ▓▓▓▓▓▓▓▓░░ 92% Completion                  │
└─────────────────────────────────────────────┘
```

### Advisor Screens Summary

| Screen | Route | Key UI |
|---|---|---|
| Profile | `/advisor/profile` | Stats: patients, sessions, rating |
| Chat | `/advisor/chat` | User list + messaging interface |
| Consultations | `/advisor/consultations` | History, notes, follow-ups |
| Earnings | `/advisor/earnings` | Revenue chart, payout history |
| Appointments | `/advisor/appointments` | Calendar, patient details |
| Slot Management | `/advisor/availability` | Weekly grid, time slot editor |

---

## 5. AFFILIATE PANEL — Layout

Same top navbar as Member (no sidebar)

### Affiliate Dashboard  `/affiliate`
```
┌─────────────────────────────────────────────┐
│ [Referrals 85] [Conversion 12%]            │
│ [Earned ₹12.4K] [Pending ₹3.2K]           │
├─────────────────────────────────────────────┤
│ PERFORMANCE CHART (monthly bars)            │
│ ▁▂▃▅▆▇▆▇█                                 │
├─────────────────────────────────────────────┤
│ RECENT ACTIVITY                             │
│ • Priya joined via your link — ₹499 earned │
│ • New asset pack available                  │
│ • Payout processed: ₹5,000                 │
└─────────────────────────────────────────────┘
```

### Affiliate Screens Summary

| Screen | Route | Key UI |
|---|---|---|
| Link Generator | `/affiliate/links` | Custom URLs, UTM builder, QR code |
| Earnings | `/affiliate/earnings` | Commission breakdown, payout request |
| Marketing Assets | `/affiliate/assets` | Banners, social templates, brand kit |

---

## Complete Screen List (47 Screens)

| # | Screen | Route | Role |
|---|---|---|---|
| 1 | Landing Page | `/` | Public |
| 2 | How To Use | `/how-to-use` | Public |
| 3 | Login | `/login` | Public |
| 4 | OTP | `/otp` | Public |
| 5 | Home Dashboard | `/app` | Member |
| 6 | Explore | `/app/explore` | Member |
| 7 | Learning | `/app/learning` | Member |
| 8 | Book Library | `/app/books` | Member |
| 9 | Book Detail | `/app/books/:id` | Member |
| 10 | Book Reader | `/app/books/:id/read` | Member |
| 11 | AI Sakhi Chat | `/app/ai-sakhi` | Member |
| 12 | Session Booking | `/app/sessions` | Member |
| 13 | Meditation | `/app/meditation` | Member |
| 14 | Wealth Sakhi | `/app/wealth` | Member |
| 15 | To-Do List | `/app/todo` | Member |
| 16 | Home Budget | `/app/finance` | Member |
| 17 | Affirmations | `/app/affirmation` | Member |
| 18 | Mental Health | `/app/mental-health` | Member |
| 19 | Love Sakhi | `/app/relationship` | Member |
| 20 | Grooming | `/app/grooming` | Member |
| 21 | Spiritual | `/app/spiritual` | Member |
| 22 | Mood Screen | `/app/mood/:type` | Member |
| 23 | Profile | `/app/profile` | Member |
| 24 | Video Player | (via explore) | Member |
| 25 | Admin Dashboard | `/admin` | Admin |
| 26 | User Management | `/admin/users` | Admin |
| 27 | Content CMS | `/admin/content` | Admin |
| 28 | Book CMS | `/admin/books` | Admin |
| 29 | Add Book | `/admin/books/add` | Admin |
| 30 | Advisor Mgmt | `/admin/advisors` | Admin |
| 31 | Appointments | `/admin/appointments` | Admin |
| 32 | Plan Mgmt | `/admin/plans` | Admin |
| 33 | Payments | `/admin/payments` | Admin |
| 34 | Sakhi CMS | `/admin/sakhi-cms` | Admin |
| 35 | Analytics | `/admin/analytics` | Admin |
| 36 | Campaigns | `/admin/notifications` | Admin |
| 37 | Advisor Dashboard | `/advisor` | Advisor |
| 38 | Advisor Appointments | `/advisor/appointments` | Advisor |
| 39 | User Profiles | `/advisor/users` | Advisor |
| 40 | Slot Management | `/advisor/availability` | Advisor |
| 41 | Consultations | `/advisor/consultations` | Advisor |
| 42 | Advisor Earnings | `/advisor/earnings` | Advisor |
| 43 | Advisor Chat | `/advisor/chat` | Advisor |
| 44 | Affiliate Dashboard | `/affiliate` | Partner |
| 45 | Link Generator | `/affiliate/links` | Partner |
| 46 | Partner Earnings | `/affiliate/earnings` | Partner |
| 47 | Marketing Assets | `/affiliate/assets` | Partner |

---

*Generated from analysis of `c:\Kiaan\nalini_mam\Health_Sakhi\Health_Sakhi\src`*
