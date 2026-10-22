# Bug Tracker

This document logs resolved bugs, regression checks, and open issues during verification cycles.

## Resolved Bugs & UI Refactoring Log

### Bug 01: Hero Section Mobile Mockup Visual Offset
- **Issue:** The mobile phone mockup card on the right side of the hero section had an offset vertical alignment. It was centered with `lg:top-[45%]` while the central group photo was bottom-aligned, causing a visual mismatch.
- **Fix:** Changed coordinates of the mockup container to `lg:top-10 lg:bottom-0 items-end` to match the exact vertical bounds of the group photo container, rendering both aligned at the bottom.

### Bug 02: Stretched Women's Image Overflowing Below
- **Issue:** Adding `scale-110` to the group photo of women shifted its visual bottom edge downwards because scale runs from the element center by default.
- **Fix:** Applied `origin-bottom` to the `img` element class list so that the scale is anchored at the bottom edge.

### Bug 03: About Us Doctor's Photo Mismatch with Button
- **Issue:** The doctor's photo card on the left was not aligned with the "Watch Demo Video" button on the right due to column height differences and grid alignment settings.
- **Fix:** Configured the grid layout to equal columns (`lg:items-stretch`), stretched both column containers (`lg:h-full`), set the left column to `justify-end`, and added `lg:mt-auto` to the right CTA container to push both the photo and button to the bottom.

### Bug 04: Login Page Exit Trapping
- **Issue:** Once the user navigated to the `/login` screen, there was no close or exit button to return to the landing page.
- **Fix:** Added a close (X) button positioned with `absolute top-6 right-6` on the login card, returning users to `/` when clicked.

### Bug 05: Mismatched Font Sizes on Facing Book Pages (Spread UI)
- **Issue:** Viewport-relative font sizes (e.g., `clamp(...)`) on header and table elements inside dynamic book pages caused text size to remain absolute and unscaled. This caused facing pages in the double-spread reading view to have mismatched, inconsistent text sizes when one page had to scale down to fit.
- **Fix:** Converted headings (`h1`, `h2`, `h3`) and table cells (`td`) to use relative `em` units (`1.35em`, `1.2em`, `1.1em`, `0.85em`), and introduced a parent-level state synchronization system (`forceScale`, `visibleScales`, `onScaleComputed`) to calculate and enforce the minimum computed scale factor on both visible pages simultaneously.

### Bug 06: Book Reader Page Crash & Syntax Leftovers
- **Issue:** Syntax errors in the app reader screen ([BookScreen.jsx](file:///c:/kiaan/New%20folder/health-sakhi-11-05-2026/src/screens/app/BookScreen.jsx)) from corrupted HTML fragments and incomplete code block updates broke compilation and caused the reader page to crash.
- **Fix:** Balanced the braces, removed the corrupted string fragments, restored the proper motion-loading wrapper, and added the missing `useCallback` import.

---

## Open Bugs
- *No open bugs currently reported.*
