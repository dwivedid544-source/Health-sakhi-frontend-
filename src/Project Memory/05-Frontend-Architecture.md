# Frontend Architecture

health sakhi is built as a single-page React application powered by Vite, providing high performance, hot-reloading, and fast client-side routing.

## Technology Stack
- **Builder/Bundler:** Vite
- **UI Library:** React 19
- **Routing:** React Router DOM (v7)
- **Styling:** TailwindCSS v4 + Custom CSS animations
- **Animation Framework:** Framer Motion
- **Icons Library:** Lucide React

---

## Modular Layout Architecture

The project splits public marketing areas from dashboard workspaces using React Router layouts:

```
App.jsx (Router)
 ├── Public Area (Wraps in LandingLayout)
 │    ├── LandingPage (/)
 │    ├── HowToUse (/how-to-use)
 │    └── Library (/library)
 ├── Member Area (Wraps in DashboardLayout role="member")
 │    └── Home (/app), Explore (/app/explore), AI Sakhi (/app/ai-sakhi)
 ├── Advisor Area (Wraps in DashboardLayout role="advisor")
 │    └── Appointments (/advisor/appointments), Slot Management (/advisor/availability)
 ├── Partner Area (Wraps in DashboardLayout role="partner")
 │    └── Affiliate Dashboard (/affiliate)
 └── Admin Panel (Wraps in DashboardLayout role="admin")
      └── Users Manager (/admin/users), CMS (/admin/content)
```

### 1. `LandingLayout.jsx`
- Handles the public navigation header (brand, tabs, "Get Started" link) and public footer.
- Integrates transparent header transitions.

### 2. `DashboardLayout.jsx`
- Role-based container that dynamically builds layouts:
  - **Sidebar Mode:** Used for Advisor and Admin flows. Displays a slate sidebar with slide-in states, a header with active notifications, and a responsive main panel.
  - **Navbar Mode:** Used for Member and Affiliate flows. Displays a top-fixed nav bar for consumer-friendly look.

## Performance Optimizations
- **Lazy Loading:** All page components are loaded lazily using `lazy()` and `Suspense` in `App.jsx`.
- **Loader Fallback:** Displays a glowing pink pulsing lotus loader while loading chunks.
- **Scroll Restoration:** Integrates a `ScrollToTop` trigger on page changes to prevent viewport issues.
