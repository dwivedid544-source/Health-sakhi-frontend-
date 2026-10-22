# Project Rules & Guidelines

These project rules must be strictly adhered to during development to maintain code quality, UI consistency, and system stability.

## 1. Code Quality & Formatting
- **Clean Structure:** Write clean React functional components. Keep component logic modular and files focused.
- **Maintain Comments:** Do not delete existing code documentation, comments, or JSDoc strings unless explicitly asked.
- **State Management:** Use LocalStorage/SessionStorage utilities safely. Avoid hardcoding test JSON keys across the site; reuse keys from configured data paths.

## 2. UI & Styling Rules
- **Color Consistency:** Do not use plain Tailwind colors (e.g. `bg-red-500`, `bg-blue-600`) for custom elements. Use the project’s specific hex color tokens (`#ff69b4`, `#E91E63`, `#4B1E5A`, `#C69214`, `#FFF7F8`, `#F5E6EA`).
- **Glassmorphism Style:** Cards must maintain standard glass values: background opacity `65%` to `80%`, rose-tinted border (`#F5E6EA`), and soft `backdrop-blur-md` elevation.
- **Animations:** All interactive cards or action items must support micro-animations (Framer Motion scale/translate hover effects).

## 3. Responsive Layout Guidelines
- **Always Test Viewports:** Changes must look beautiful on mobile (viewport ~375px) as well as desktop (viewport ~1440px).
- **Stacking Behavior:** Columns must stack vertically on mobile (using `grid-cols-1 md:grid-cols-12` or similar) and align side-by-side on desktop (`lg:`).
- **Absolute Positioning:** When using absolute coordinates, ensure the parent has `relative` and positioning does not overlap active text columns or buttons.
