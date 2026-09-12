# Component contracts

The component contract layer is the stable override surface between raw tokens and component selectors. Set these variables on `Theme`, a parent element, or an individual component.

| Variable | Default | Role |
| --- | --- | --- |
| `--ui-control-height` | `var(--control-h-m)` | Default interactive control height |
| `--ui-control-radius` | `var(--radius-4)` | Control corner radius |
| `--ui-control-padding-inline` | `var(--space-xs)` | Horizontal control padding |
| `--ui-control-padding-block` | `var(--space-3xs)` | Vertical control padding |
| `--ui-control-border-width` | `var(--border-width)` | Control border thickness |
| `--ui-control-transition` | `border-color .15s ease, box-shadow .15s ease, background .15s ease` | Control hover and focus transition |
| `--ui-field-padding-inline` | `.75rem` | Form-field horizontal padding |
| `--ui-field-padding-block` | `.65rem` | Vertical form-field padding |
| `--ui-card-radius` | `var(--radius-6)` | Card corner radius |
| `--ui-card-padding` | `var(--space-m)` | Card inner spacing |
| `--ui-card-shadow` | `var(--shadow-s)` | Card elevation |
| `--ui-button-gap` | `var(--space-2xs)` | Button content gap |
| `--ui-badge-height` | `1.5rem` | Badge minimum height |
| `--ui-badge-radius` | `var(--radius-full)` | Badge corner radius |
| `--ui-badge-padding-inline` | `.55rem` | Badge horizontal padding |
| `--ui-alert-icon-size` | `1.5rem` | Alert icon box size |
| `--ui-check-size` | `1.2rem` | Checkbox indicator size |
| `--ui-switch-width` | `2.5rem` | Switch track width |
| `--ui-switch-height` | `1.4rem` | Switch track height |
| `--ui-switch-thumb-size` | `1.14rem` | Switch thumb size |
| `--ui-switch-thumb-offset` | `1.1rem` | Switch checked offset |
| `--ui-avatar-size-sm` / `--ui-avatar-size-md` / `--ui-avatar-size-lg` | `2rem` / `2.75rem` / `4rem` | Avatar sizes |
| `--ui-progress-height` | `.55rem` | Progress track height |
| `--ui-stepper-number-size` | `1.9rem` | Stepper number size |
| `--ui-popover-radius` | `var(--radius-6)` | Popover and dialog corner radius |
| `--ui-popover-shadow` | `var(--shadow-m)` | Popover and dialog elevation |
| `--ui-focus-ring-width` | `var(--focus-ring-width)` | Focus outline thickness |
| `--ui-focus-ring-offset` | `2px` | Focus outline offset |
| `--ui-overlay-z-index` | `var(--z-modal)` | Overlay stacking layer |
| `--ui-toast-z-index` | `var(--z-toast)` | Toast stacking layer |

The contract deliberately does not introduce colour aliases. Colour remains in the permitted raw palette, so a consumer can replace the visual language without learning a second colour vocabulary.

## Contract ownership by component

Use the smallest scope that meets the need: a component instance for one exception, a parent or `Theme` for a product area, and `:root` for application-wide density.

| Components | Contracts to override |
| --- | --- |
| `Button`, `AnimatedButton` | `--ui-control-*`, `--ui-button-gap` |
| `Input`, `Textarea`, `Select` | `--ui-control-*`, `--ui-field-padding-*` |
| `Card`, `AnimatedCard` | `--ui-card-*` |
| `Badge` | `--ui-badge-*` |
| `Alert` | `--ui-alert-icon-size` |
| `Checkbox` | `--ui-check-size` |
| `Switch` | `--ui-switch-*` |
| `Avatar` | `--ui-avatar-size-sm`, `--ui-avatar-size-md`, `--ui-avatar-size-lg` |
| `Progress` | `--ui-progress-height` |
| `Stepper` | `--ui-stepper-number-size` |
| `Dialog`, `Tooltip` | `--ui-popover-radius`, `--ui-popover-shadow`, `--ui-focus-*`, `--ui-overlay-z-index` |
| `Toast` | `--ui-toast-z-index` plus `--ui-focus-*` for any surrounding controls |

Motion, canvas, and pattern adapters use the same raw palette and focus contract but do not add a second component geometry vocabulary. Their effect-specific options are Svelte props documented on each live component page.
