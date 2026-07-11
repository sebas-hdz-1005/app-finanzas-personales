---
name: Cyber-Fiducia
colors:
  surface: '#0e1321'
  surface-dim: '#0e1321'
  surface-bright: '#343948'
  surface-container-lowest: '#090e1c'
  surface-container-low: '#161b2a'
  surface-container: '#1a1f2e'
  surface-container-high: '#252a39'
  surface-container-highest: '#303444'
  on-surface: '#dee2f6'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dee2f6'
  inverse-on-surface: '#2b303f'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ffffff'
  on-secondary: '#283500'
  secondary-container: '#c3f400'
  on-secondary-container: '#556d00'
  tertiary: '#fff5f4'
  on-tertiary: '#680008'
  tertiary-container: '#ffd0cb'
  on-tertiary-container: '#c20018'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#930010'
  background: '#0e1321'
  on-background: '#dee2f6'
  surface-variant: '#303444'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-performance personal finance management, targeting tech-native users and high-frequency investors. The brand personality is precise, avant-garde, and authoritative, evoking the feeling of an advanced flight deck or a cyberpunk command center. 

The visual style is a hybrid of **Glassmorphism** and **High-Tech Minimalism**. It utilizes translucent surfaces with refractive blurs to suggest depth, paired with razor-sharp geometric lines that emphasize data accuracy. The interface should feel like a projection rather than a flat surface—highly interactive, responsive, and data-dense, yet maintaining a sophisticated composure through generous use of dark space.

## Colors

The palette is optimized for OLED displays and low-light environments. 
- **Primary (Neon Cyan):** Used for interactive elements, primary call-to-actions, and active data streams.
- **Secondary (Lime Green):** Reserved exclusively for positive financial growth, gains, and "safe" status indicators.
- **Tertiary (Alert Red):** Used sparingly for debt warnings, market drops, or critical system errors.
- **Neutrals:** A range of deep navies and charcoals provide a low-glare foundation. Use layered transparency for containers to ensure text remains legible against complex backgrounds.

## Typography

This design system uses a triple-font strategy to balance aesthetics and utility:
1. **Sora** handles headlines with a modern, geometric flair that feels tech-forward.
2. **Hanken Grotesk** is used for body copy, providing high readability with its sharp, contemporary grotesque letterforms.
3. **JetBrains Mono** is utilized for all numerical data, currency values, and labels. Its fixed-width nature ensures that fluctuating financial digits do not cause layout "jitter" during real-time updates.

For mobile scales, reduce `display-lg` to 32px and `headline-lg` to 24px.

## Layout & Spacing

The layout follows a **fluid-to-fixed grid** model. On desktop, content resides within a 12-column grid with a maximum width of 1440px. Gutters are kept wide (24px) to maintain the "HUD" feeling of distinct, floating modules.

Spacing follows a strict 4px baseline grid. Components should use consistent internal padding (usually 16px or 24px) to ensure a modular, structured appearance. On mobile, the layout collapses to a single column with 16px side margins, where cards take up the full width to maximize data display area.

## Elevation & Depth

Depth is conveyed through **Backdrop Refraction** and **Luminous Outlines** rather than traditional drop shadows.
- **Level 1 (Base):** Darkest background (#05070a).
- **Level 2 (Panels):** Semi-transparent surfaces with a 20px blur. Borders are 1px thick, semi-transparent white (10% opacity).
- **Level 3 (Active/Hover):** Surfaces gain a subtle inner glow using the primary neon cyan. Outer glows are reserved for high-priority alerts or active selections to simulate a holographic emission.
- **Transitions:** Use smooth, linear-out easing (200ms) for all depth changes to maintain a "responsive machine" feel.

## Shapes

The shape language is **Precision-Soft**. While the design is futuristic, we avoid 0px sharp corners to prevent the UI from feeling aggressive. A consistent 0.25rem (4px) radius is applied to standard components, with 0.5rem (8px) for larger layout containers. 

This subtle rounding mimics the high-end machining of premium hardware. Buttons and decorative elements may occasionally use 45-degree chamfered corners (clipped corners) to further reinforce the "advanced tech" aesthetic.

## Components

- **Buttons:** Primary buttons use a solid Neon Cyan background with black text. Secondary buttons are "Ghost" style with a Cyan border and a subtle glow on hover.
- **Data Cards:** Must feature a `backdrop-filter: blur(12px)` and a top-left "status" light (small 4px circle) that changes color based on the data's health.
- **Inputs:** Underlined or fully boxed with a subtle background tint. The cursor and focus state must trigger a 2px Neon Cyan border glow.
- **Charts:** Use thin, 1.5pt strokes. Fills should be vertical gradients transitioning from the indicator color (Cyan/Green) to transparent.
- **Chips/Labels:** Small, mono-spaced tags with a low-opacity background tint of their functional color.
- **Glow Indicators:** Use CSS `box-shadow` with high blur (15-20px) and low opacity to simulate light emitting from indicators and active toggles.