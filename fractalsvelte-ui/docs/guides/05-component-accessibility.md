# Component accessibility

The component API is designed around native HTML semantics. Preserve those semantics when composing a component and supply the labels that the browser cannot infer.

## Required consumer checks

- Give icon-only buttons an accessible name.
- Give `Input`, `Textarea`, and `Select` an associated label or explicit accessible label.
- Give `Dialog`, `Tooltip`, `Carousel`, `Stepper`, and motion regions meaningful labels.
- Keep disabled and loading states truthful; do not use colour alone to communicate status.
- Keep focusable controls in a logical order when composing overlays and navigation.

`Dialog` uses a native `<dialog>`, `Accordion` uses `<details>`, and form controls use native input/select/textarea elements. Do not replace these semantics with a visually similar `div` implementation.

## Component naming checklist

| Component | Semantic requirement |
| --- | --- |
| `Button`, `AnimatedButton` | Keep the native button `type`; provide visible snippet content or an accessible name for icon-only content. |
| `Input`, `Textarea` | Pass `ariaLabel` or connect the supplied `id` to a visible `<label>` in the consuming markup. `name` is available for form submission. |
| `Select` | Pass a meaningful `placeholder` or provide a surrounding label; option objects support `disabled`. |
| `Checkbox`, `Switch` | Provide `label` or a label snippet; preserve the native checkbox and switch roles. |
| `Dialog` | Pass a unique `title`; use `description` for supporting context and keep the bound `open` state authoritative. |
| `Tooltip` | Keep `content` short and supplemental; the wrapped control must remain understandable without it. |
| `Progress` | Pass `label` when the progress has no adjacent visible name. |
| `Carousel`, `MotionList`, `Stepper`, `Marquee` | Pass `label` when the surrounding page does not already name the region. Use stable IDs for item arrays. |
| Canvas and pattern effects | Pass `label` only when the effect conveys information; otherwise treat it as decorative and keep semantic content outside the canvas. |

Keyboard, focus-ring, reduced-motion, contrast, and background guidance is collected in [Accessibility](19-accessibility.md).
