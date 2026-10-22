# health sakhi - Frontend Flow Documentation

health sakhi is a comprehensive wellness platform designed with a role-based architecture to cater to Members, Advisors, Partners, and Administrators.

## 🚀 Technology Stack
- **Framework**: Vite + React
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)
- **UI Components**: custom-built professional dashboard layouts with glassmorphism and modern aesthetics.

---

## 🏗️ Application Architecture

The application uses a centralized routing structure in `App.jsx` and a highly flexible `DashboardLayout.jsx` that adapts its UI based on the user's role.

### ⚓ Routing Overview

```mermaid
graph TD
    Start((Start)) --> Landing[Landing Page /]
    Landing --> Login[Login /login]
    Login --> OTP[OTP Screen /otp]
    
    OTP --> RoleSelector{User Role?}
    
    RoleSelector -- Member --> MemberApp[/app/*]
    RoleSelector -- Advisor --> AdvisorApp[/advisor/*]
    RoleSelector -- Admin --> AdminApp[/admin/*]
    RoleSelector -- Partner --> PartnerApp[/affiliate/*]
    
    subgraph "Public Area"
    Landing
    Login
    OTP
    end
```

---

## 🏠 Landing Page Detailed Breakdown

The Landing Page (`/`) is the storefront of Health Sakhi, designed with a warm, "sisterly" aesthetic to build immediate trust.

### 1. Hero Section (First Impression)
- **Value Proposition**: "Your Personal Wellness Sakhi is here for you".
- **Interactive Mood Selector**: Allows users to input their current state (Happy, Tired, Stressed, Low Energy) for an immediate empathetic response.
- **Visuals**: Modern glassmorphism badges showing "Healing Streaks" and "AI Sakhi messages".
- **Stats**: Highlights social proof (50K+ women healed, 200+ programs, 98% happiness rate).

### 2. Core Features (The "Wellness Stack")
- **Women's Health Hub**: Expert guidance on PCOD and hormonal balance.
- **Emotional Healing**: Mindfulness tools and journaling for inner peace.
- **AI Sakhi Chat**: 24/7 non-judgmental emotional companion.
- **Healing Book Library**: Digital resources on nutrition, heart health, and wellness.
- **Video Courses**: High-quality healing programs (puberty, pregnancy, stress).
- **Advisor Sessions**: 1-on-1 consultations with certified professional advisors.
- **Meditation Sakhi**: Guided mindfulness and breathing exercises.
- **Wealth Sakhi**: Financial empowerment and smart wealth tools.
- **To-Do List**: Daily growth and productivity organizer.
- **Finance Sakhi**: Household expense and savings management.
- **Affirmations**: Daily positive energy and empowering statements.
- **Mental Health**: Comprehensive emotional well-being support.
- **Love Sakhi**: Guidance for building healthy bonds.
- **Grooming Sakhi**: Self-care and confidence-building tips.
- **Spiritual Sakhi**: Solutions based on Bhagavad Gita wisdom.

### 3. The 4-Step Journey
A clear roadmap for new users:
1. **Create Profile**: 2-minute setup to personalize the experience.
2. **Explore Journey**: AI-curated healing paths.
3. **Heal & Grow**: Daily mood tracking and habit building.
4. **Celebrate Wins**: Visualizing wellness score growth and milestones.

### 4. Pricing & Membership
- **Sakhi Free**: Basic access (10 videos, limited AI chat, 5 books).
- **Sakhi Premium**: Unlimited content, full library, and 1 advisor session/month (Monthly/Yearly options).
- **Sakhi Elite**: Priority support, custom nutrition plans, and 4 advisor sessions/month.

### 5. Social Proof & Community
- **Interactive Testimonials**: Real-world success stories from the community (Priya, Ananya, Meera etc.).
- **Trust Elements**: 100% Safe & Private, Certified Advisors, and Mobile-Friendly badges.

---

## 👥 User Roles & Flow Details

### 1. 👤 Member (User) Flow
**Path:** `/app`
Designed for individuals seeking wellness guidance.

- **Home**: Personalized dashboard with health highlights and quick links.
- **Explore**: Searchable wellness content and recommendations.
- **My Learning**: Video modules and educational tracks.
- **Books**: Digital library for wellness resources.
- **AI Sakhi**: Interactive AI-powered health assistant.
- **Book Sessions**: Scheduler for connecting with advisors.
- **Meditation Sakhi**: Inner peace and calm exercises.
- **Wealth Sakhi**: Financial empowerment module.
- **To-Do List**: Productivity and task management.
- **Finance Sakhi**: Family budget and expense tracker.
- **Affirmation**: Daily mindset and positive thinking.
- **Mental Health**: Dedicated emotional well-being screen.
- **Love Sakhi**: Bond nurturing and guidance.
- **Grooming Sakhi**: Personal care and confidence tools.
- **Spiritual Sakhi**: Gita-based spiritual guidance.

### 2. 🧑‍⚕️ Advisor (Consultant) Flow
**Path:** `/advisor`
A professional portal for healthcare experts and consultants.

- **Dashboard**: Overview of upcoming sessions and performance.
- **Appointments**: Management of booked consultations.
- **My Users**: CRM for tracking member progress.
- **Chat**: Secure messaging with members.
- **Availability**: Slot management for session bookings.
- **Earnings**: Financial tracking and transparency.

### 3. 🛠️ Admin (System) Flow
**Path:** `/admin`
The "Control Center" for full platform oversight.

- **User/Advisor Mgmt**: Complete CRUD operations on platform users.
- **CMS (Content/Books)**: Managing the educational and resource library.
- **Financials**: Oversight of plans, payments, and revenue logs.
- **Analytics**: Data-driven insights into platform usage.
- **Campaigns**: Notification and marketing center.

### 4. 💰 Partner (Affiliate) Flow
**Path:** `/affiliate`
Growth-focused dashboard for influencers and growth partners.

- **Home**: Referral performance overview.
- **Links**: Generation and tracking of affiliate links.
- **Earnings**: Commission tracking and payouts.
- **Assets**: Access to marketing collateral and brand kits.

---

## 🎨 UI/UX Design System

The application follows a consistent, premium design language:

### Navigation Components
- **Member/Partner**: Uses `MemberNavbar` (Top navigation with glassmorphism).
- **Advisor/Admin**: Uses `Sidebar` (Lateral dark-mode navigation) + `DashboardNavbar` (Header).

### Color Palette & Aesthetics
- **Primary Accent**: `#ff69b4` (Sakhi Pink)
- **Backgrounds**: Soft Rose (`#FFF7F8`) for members, Slate (`#0f172a`) for admins.
- **Consistency**: High-fidelity cards, skeleton loaders, and shadow-based elevations.

---

## 🔄 Interaction Logic

### Authentication Flow
1. **Login**: User enters credentials on `/login`.
2. **Verification**: OTP is sent and validated on `/otp`.
3. **Session**: User role is determined and they are redirected to their specific dashboard module.

### Dashboard Adaptation
The `DashboardLayout` component dynamically switches between:
- **Top Nav Mode**: For consumer-facing roles (Member/Partner).
- **Sidebar Mode**: For professional/management roles (Advisor/Admin).

### Navigation State
Active routes are tracked using the `useLocation` hook, ensuring the UI accurately reflects the current section with visual indicators.



_--------------------------------------------------------------
PLAN FLOW:-

HealthSakhi platform par Member Plan flow aur limits is tarah kaam karti hain:

1. Plan Select aur Approval Flow
Plan Choice (Landing Page): User landing page par koi bhi plan select karta hai (e.g., Free Sakhi, Premium Pro, ya Annual Premium).
Signup: Select kiya hua plan Signup form me auto-selected aur highlight ho jaata hai. Jab signup form submit hota hai, toh request state "Pending" save hoti hai.
Admin Approval: Admin dashboard se jab member ki request "Active" approve ho jaati hai, tabhi member portal par login kar sakta hai.
2. Login ke baad Plan ke hisab se kya dikhega?
Jab approved member login karke dashboard par jaata hai, toh unka plan dynamic check hota hai:

🌿 Agar Member "Free Sakhi" Plan par hai:
Profile Screen: Profile par ek dynamic badge dikhta hai jisme "Free Sakhi Member" likha hota hai aur niche upgrade button prompt hota hai.
AI Sakhi Chat Limit: Chat page (ai-sakhi) par Free members ko sirf 5 chats/day ki limit milti hai. 5 chats hone ke baad upgrade banner pop-up hota hai.
1-on-1 Consultation Blocked: Jab free member certified doctors ya advisors ke sath custom appointment schedule karne ki koshish karega, toh system use consult booking block karega aur upgrade prompt dikhayega.
⭐ Agar Member "Premium Pro" ya Premium Plan par hai:
Unlimited AI Sakhi Chat: AI chatbot ke sath bina kisi restriction ke unlimited dynamic chats accessible hoti hain.
Advisor Session Bookings Active: Doctor consultations aur health experts ke saath slots booking interface fully unlock ho jata hai.
Profile Premium Status: Profile screen par "Premium Active" badge dikhta hai.
Receipts Generation: ReceiptsScreen par unka dynamic pricing receipt format active rehta hai jise wo download kar sakte hain.




---------------------------------------------


Fix Karne Ke 2 Options Hain
Option A — Full Re-compile (Best Quality)

Compiler dobara chalao, is baar sab pages translate karo
⏱️ Time: 4-6+ ghante (333+ pages × 18 books × 6 languages)
✅ Result: Har page sahi language mein
Option B — Browser-Side Real-Time Translation (Fast to implement)

Jab user page turn kare, tab Google Translate API call karo live
⚡ 1-2 second delay per page flip
✅ No re-compile needed
❌ Internet chahiye hoga aur kabhi kabhi rate limit