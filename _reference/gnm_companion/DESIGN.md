---
name: GNM Companion
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-margin: 32px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a "Learning OS" experience, specifically tailored for the rigors of nursing education. The brand personality is **Academic yet Empathetic**, balancing the high-stakes precision of medical training with a supportive, modern SaaS interface.

The visual style is **Premium Minimalism** with subtle **Tactile** influences. It draws inspiration from Apple’s educational ecosystems by prioritizing focus and clarity, while incorporating the playful progress-tracking logic of modern learning apps. The interface should feel like a high-end digital planner—organized, spacious, and calming—to reduce the cognitive load on students. 

**Key Design Principles:**
- **Clarity over Decoration:** Every element serves a functional purpose in the learning journey.
- **Academic Rigor:** Clean lines and structured grids convey professionalism.
- **Supportive Feedback:** Use of soft colors and rounded shapes to provide a welcoming environment for study.

## Colors
The palette is rooted in "Professional Blue," a color associated with trust and stability in the medical field. This is complemented by "Teal" for success states and "Amber" for focus and cautionary alerts.

- **Primary (#2563EB):** Used for primary actions, progress bars, and active navigation states.
- **Secondary (#14B8A6):** Reserved for "Completed" states, health-related modules, and positive feedback loops.
- **Accent (#F59E0B):** Used sparingly for "Exam Prep" reminders, urgent notifications, or highlighting key annotations.
- **Surface Strategy:** Backgrounds utilize a cool off-white (`#F8FAFC`) to minimize glare during long study sessions, while cards utilize pure white (`#FFFFFF`) to create clear separation.

## Typography
The typography system uses **Plus Jakarta Sans** for headlines to provide a friendly, modern, and slightly geometric personality. This is paired with **Inter** for body text to ensure maximum legibility during heavy reading of medical documentation.

- **Headlines:** Use Bold (700) or ExtraBold (800) for H1 and H2 to create a strong hierarchy.
- **Body Text:** Standardize on 16px for general content. For long-form medical articles or case studies, use `body-lg` (18px) to improve focus.
- **Labels:** Use Inter Medium or SemiBold for UI labels to distinguish them from reading content.

## Layout & Spacing
This design system utilizes a **Fixed Grid** approach for desktop dashboards to maintain a "Workspace" feel similar to Notion, transitioning to a **Fluid Grid** for mobile devices.

- **Desktop:** 12-column grid with a max-width of 1440px. 24px gutters.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px margins.
- **Vertical Rhythm:** Use increments of 8px (2 units) for most component spacing. For large sections, use 48px (xl) to create breathing room, emphasizing the "Minimal" aesthetic.

## Elevation & Depth
Depth is created using **Tonal Layers** and **Ambient Shadows** to suggest a physical stack of papers and folders.

- **Base Level:** `#F8FAFC` background.
- **Mid Level (Cards):** `#FFFFFF` with a very soft, diffused shadow: `0px 4px 20px rgba(15, 23, 42, 0.05)`.
- **High Level (Popovers/Modals):** Focused shadow with more spread: `0px 10px 30px rgba(15, 23, 42, 0.1)`.
- **Glassmorphism:** Apply exclusively to Hero Cards or Dashboard Summaries. Use a `backdrop-filter: blur(12px)` with a semi-transparent white stroke (1px, 20% opacity) to create a "frost" effect over brand colors.

## Shapes
The shape language is approachable and soft. By using a baseline roundedness of **16px-20px**, we avoid the clinical sharpness of traditional medical software.

- **Standard Cards:** 16px radius (`rounded-lg`).
- **Outer Containers:** 24px radius (`rounded-xl`).
- **Buttons & Chips:** Full pill-shape or 12px radius depending on context.
- **Interactive Elements:** Form inputs should match the 12px radius of buttons for consistency.

## Components
- **Buttons:** Primary buttons use a solid `#2563EB` fill with white text. Secondary buttons use a subtle light blue ghost style. Use 16px padding on the horizontal axis.
- **Cards:** White background, 16px border-radius, and a subtle 1px stroke in `#E2E8F0` for definition.
- **Progress Trackers:** High-contrast Teal (`#14B8A6`) for progress bars. Use rounded caps and a thickness of at least 8px for tactile visibility.
- **Learning Chips:** Small, rounded labels for categories (e.g., "Anatomy", "Pharmacology"). Use low-saturation background tints of the primary colors with high-saturation text.
- **Inputs:** Clean fields with `#F1F5F9` backgrounds that shift to a white background with a Primary Blue border on focus.
- **Navigation:** Vertical sidebar for desktop with large, clear icons and Medium weight Inter text. On active state, use a subtle "indicator bar" on the left of the menu item.
- **Specialty Components:** 
    - *Flashcard:* A card component with a distinct border and high-contrast typography for "Question" vs "Answer" states.
    - *Case Study Block:* A bordered container with a vertical accent line in Secondary Teal to signify educational content.