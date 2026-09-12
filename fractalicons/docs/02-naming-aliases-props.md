---
title: Naming, Aliases, Props
description: Family prefixes, the dual prefix/full-name export scheme, and every <Icon /> prop.
type: fractalicons
---

| Family                 | Prefix | Icons | Import Path                     | Primary Export Example                  | Alias Example                  |
| :--------------------- | :----- | :---- | :------------------------------ | :-------------------------------------- | :----------------------------- |
| **Lucide**             | `lu`   | 1,743 | `fractalicons/lucide`           | `luActivity`, `luSparkles`              | `lucideActivity`               |
| **Phosphor**           | `ph`   | 1,512 | `fractalicons/phosphor`         | `phAcorn`, `phHeart`                    | `phosphorAcorn`                |
| **Phosphor Fill**      | `phf`  | 1,512 | `fractalicons/phosphorfill`     | `phfAcornFill`, `phfHeartFill`          | `phosphorfillAcornFill`        |
| **Remix Icon**         | `re`   | 1,444 | `fractalicons/remix`            | `reFireLine`, `re24HoursLine`           | `remixFireLine`                |
| **Remix Icon Fill**    | `ref`  | 1,292 | `fractalicons/remixfill`        | `refFireFill`, `ref24HoursFill`         | `remixfillFireFill`            |
| **Iconoir**            | `ic`   | 1,383 | `fractalicons/iconoir`          | `icAccessibilitySign`, `icActivity`     | `iconoirAccessibilitySign`     |
| **Iconoir Fill**       | `icf`  | 288   | `fractalicons/iconoirfill`      | `icfAdobeAfterEffects`                  | `iconoirfillAdobeAfterEffects` |
| **Material Animated**  | `maa`  | 545   | `fractalicons/materialanim`     | `maaLoadingLoop`, `maaAccountAlertLoop` | `materialanimLoadingLoop`      |
| **Ant Design Icons**   | `an`   | 150   | `fractalicons/anticons`         | `anAccountBook`, `anAlert`              | `anticonsAccountBook`          |
| **CoreUI Icons**       | `cu`   | 562   | `fractalicons/coreui`           | `cuSpeedometer`, `cuChartLine`          | `coreuiSpeedometer`            |
| **Famicons**           | `fa`   | 1,342 | `fractalicons/famicons`         | `faFlameOutline`, `faHeartSharp`        | `famiconsFlameOutline`         |
| **Circum Icons**       | `ci`   | 288   | `fractalicons/circum`           | `ciCoffeeCup`, `ciSearch`               | `circumCoffeeCup`              |
| **Boxicons Regular**   | `bx`   | 814   | `fractalicons/boxregular`       | `bxAbacus`, `bxAccessibility`           | `boxregularAbacus`             |
| **Boxicons Solid**     | `bxs`  | 665   | `fractalicons/boxsolid`         | `bxsAdjust`, `bxsAddToQueue`            | `boxsolidAdjust`               |
| **css.gg**             | `gg`   | 704   | `fractalicons/cssgg`            | `ggAbstract`, `ggAddR`                  | `cssggAbstract`                |
| **Feather**            | `fe`   | 287   | `fractalicons/feathericons`     | `feActivity`, `feAlertCircle`           | `feathericonsActivity`         |
| **Font Awesome**       | `far`  | 273   | `fractalicons/fontawesome`      | `farAddressBook`, `farAlarmClock`       | `fontawesomeAddressBook`       |
| **Font Awesome Solid** | `fas`  | 2,001 | `fractalicons/fontawesomesolid` | `fasHeart`, `fasUser`                   | `fontawesomesolidHeart`        |
| **Heroicons**          | `he`   | 296   | `fractalicons/heroicons`        | `heAcademicCap`, `heBeaker`             | `heroiconsAcademicCap`         |
| **Heroicons Solid**    | `hef`  | 296   | `fractalicons/heroiconsfill`    | `hefAcademicCap`, `hefBeaker`           | `heroiconsfillAcademicCap`     |
| **Octicons**           | `oc`   | 604   | `fractalicons/octicons`         | `ocAlert16`, `ocRepo24`                 | `octiconsAlert16`              |
| **Simple Icons**       | `si`   | 3,095 | `fractalicons/simple`           | `siGithub`, `siFigma`                   | `simpleGithub`                 |
| **Simple Line Icons**  | `sl`   | 189   | `fractalicons/simpleline`       | `slActionRedo`, `slAnchor`              | `simplelineActionRedo`         |
| **Tabler**             | `tb`   | 5,130 | `fractalicons/tabler`           | `tbBell`, `tbBrandGithub`               | `tablerBell`                   |
| **Tabler Filled**      | `tbf`  | 1,054 | `fractalicons/tablerfill`       | `tbfAccessible`, `tbfAdCircle`          | `tablerfillAccessible`         |

**Total: 27,469 icons across 25 families.**


## Naming & Aliases

Every icon is exported under **two names**, both pointing at the same `IconData` object:

- **Prefix name** (short, ergonomic): `luActivity`, `phHeart`, `maaLoadingLoop`.
- **Full-name alias** (explicit family): `lucideActivity`, `phosphorHeart`, `materialanimLoadingLoop`.

Use whichever reads better in your codebase — they are interchangeable. Names are derived from the upstream icon file name in `camelCase`; icons that begin with a digit are prefixed with `icon` (e.g. a `24-hours` icon becomes `re24HoursLine`).


## Component Props

| Prop         | Type                                                            | Default        | Description                                                                                                                                                    |
| :----------- | :-------------------------------------------------------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`       | `IconData`                                                      | **(required)** | The icon data object imported from any family.                                                                                                                 |
| `size`       | `number \| string`                                              | `'1em'`        | Size of the icon. Numbers are treated as `px` (e.g. `24` → `24px`); strings pass through (`'1.5rem'`). Defaulting to `1em` makes icons scale with `font-size`. |
| `title`      | `string`                                                        | `undefined`    | Accessible label for screen readers. Sets `role="img"`, `aria-labelledby`, and a `<title>`.                                                                    |
| `decorative` | `boolean`                                                       | `!title`       | When `true`, adds `aria-hidden="true"`. Automatically `false` when a `title` is provided.                                                                      |
| `trigger`    | `'load' \| 'hover' \| 'click' \| 'visible' \| 'loop' \| 'none'` | `'load'`       | When an **animated** icon (`materialanim`) plays. No effect on static icons. See below.                                                                        |
| `...rest`    | `SVGAttributes`                                                 | `{}`           | All standard SVG element attributes (`class`, `style`, `stroke`, `fill`, `transform`, data attributes, event handlers, …) are forwarded to the `<svg>`.        |

Types are exported from the package root for convenience:

```ts
import type { IconData, IconSize, AnimationTrigger } from 'fractalicons';
```
