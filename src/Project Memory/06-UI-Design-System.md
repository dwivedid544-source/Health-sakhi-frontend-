# UI Design System

health sakhi is built on a custom design system characterized by soft gradients, glassmorphism, and a warm color scheme.

## Design Tokens

### 1. Color Palette

| Token | CSS Class | Color Code | Usage |
|---|---|---|---|
| **Primary Accent** | `text-[#E91E63]` / `bg-[#ff69b4]` | `#ff69b4` / `#E91E63` | CTAs, active status, badges |
| **Dark Theme** | `text-[#4B1E5A]` / `bg-[#15192c]` | `#4B1E5A` / `#15192c` | Main Headings, Admin layouts |
| **Muted Accents** | `text-[#C4A0AC]` | `#C4A0AC` / `#C69214` | Subtitle text, secondary labels |
| **Backgrounds** | `bg-rose-50/20` / `bg-[#FFF7F8]` | `#FFF7F8` / `#FFF0F2` | Base dashboard grids, clean cards |
| **Borders** | `border-[#F5E6EA]` | `#F5E6EA` / `#F0E1E4` | Soft dividers, card boundaries |

### 2. Typography
- **Primary Body Font:** Poppins
- **Heading Font Pairing:** Serif fonts (`font-serif`) mixed with modern `Plus Jakarta` and `Outfit` pairings to create a premium, authoritative, yet approachable style.

### 3. Glassmorphism Specifications
- **Cards Background:** `bg-white/65` or `bg-white/80`
- **Blur Effect:** `backdrop-blur-md` or `backdrop-blur-xl`
- **Card Borders:** `border-white/40` or `border-[#F5E6EA]`
- **Shadowing:** Custom elevation `shadow-[0_15px_40px_rgba(233,30,99,0.06)]` or `shadow-2xl shadow-pink-950/20`.

## Interactive Micro-Animations (Framer Motion)
- **Hover Scales:** Elements scale to `1.02` or `1.05` on hover.
- **Hover Translates:** Mockups slide up slightly (`hover:-translate-y-2`) on hover.
- **Tap Feedback:** Buttons compress slightly (`whileTap={{ scale: 0.98 }}`) on click.
- **Entry Animations:** Cards slide and fade up (`initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}`).
