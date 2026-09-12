---
title: Markgraphy animated set
description: Shared contract and unit-by-unit status for the animated graph set in src/lib/animated/ — glyph whitelist, character-grid discipline, reduced-motion and determinism rules.
type: markgraphy
---

# Markgraphy animated set

Ideated 2026-08-30 and built by five parallel agents; each unit keeps the glyph-only, one-accent, reduced-motion-safe contract. Lives in `src/lib/animated/`. Status values: `implemented — pending user evaluation`.

## Contract (shared by all units)

- **--graph-* tokens only.** No hex accents; the site accent picker re-themes all of them.
- **Glyph whitelist.** Art uses ASCII plus U+2500-259F only (the set Geist Mono actually covers — see specs-markgraphy-diagrams.md). No `▲▼→←●○◆■`, no braille.
- **Character-grid discipline.** No letter-spacing or padding inside art; in-art font weights ≤ 600.
- **Reduced motion.** `animated={false}` or `prefers-reduced-motion: reduce` freezes each unit at a meaningful static state (full text, first window, developed frame). Explicit user playback (play/step buttons) still works.
- **Determinism.** mulberry32 PRNG seeds (`seedNum`) reproduce boards/burns/rain and keep SSR HTML identical to first client paint.

## Units

| # | Component | What it does | Status |
| --- | --- | --- | --- |
| 1 | GraphTypewriter | Types lines with a blinking block cursor; hold, loop, or stop | implemented — pending user evaluation |
| 2 | GraphTicker | One-row status marquee rotating whole [ OK ] / [ WARN ] / [ DOWN ] tokens | implemented — pending user evaluation |
| 3 | GraphScope | Scrolling oscilloscope window, line or area, newest column accent | implemented — pending user evaluation |
| 4 | GraphStream | Live KPI: appending sparkline, big value, updated-ago caption (graphNow) | implemented — pending user evaluation |
| 5 | GraphFlowPlayer | Play/pause step-player on a │ spine; active step + detail reveal; controls | implemented — pending user evaluation |
| 6 | GraphLife | Conway in █ with ▒ trails, toroidal edges, gen/pop readout, play/step/reset | implemented — pending user evaluation |
| 7 | GraphMandel | Slow zoom into seahorse valley, charset escape ramp, accent core | implemented — pending user evaluation |
| 8 | GraphPulse | Appending uptime blips, legend, % up, last-check caption | implemented — pending user evaluation |
| 9 | GraphSpinners | slash / dots / bounce / bar frame sets + custom `frames` escape hatch | implemented — pending user evaluation |
| 10 | GraphFire | Demoscene fire, heat ramp █▓▒░ with random cooling (decorative, aria-hidden art) | implemented — pending user evaluation |
| 11 | GraphRain | Matrix rain: per-column speeds, █ heads, fading ▓▒░ trails (decorative, aria-hidden art) | implemented — pending user evaluation |

## Wiring

| Surface | Change | Status |
| --- | --- | --- |
| `src/lib/index.ts` | All eleven components + prop types exported under "// Animated" | implemented — pending user evaluation |
| `src/site/docs/catalog.ts` | Eleven `ComponentDoc` entries (slugs `graph-typewriter` … `graph-rain`) | implemented — pending user evaluation |
| `/docs/[slug]` | Live previews + copyable code for all eleven | implemented — pending user evaluation |
| `/llms.txt` | "Animated" table under Diagrams | implemented — pending user evaluation |
| `/sitemap.xml` | Eleven animated slugs | implemented — pending user evaluation |
| Home gallery | Animated row extended with Ticker strip + Scope/Pulse grid | implemented — pending user evaluation |
| `/docs/animations` | Own category: landing page with all eleven live on one page; header nav item, docs sidebar "Animated" group, Introduction split into Components/Animated, footer link, mobile strip chip, sitemap path, llms.txt link | implemented — pending user evaluation |

Verification: `pnpm check` (0/0), `pnpm build`, `/docs/<animated-slug>` pages, home gallery, accent picker re-themes all units.
