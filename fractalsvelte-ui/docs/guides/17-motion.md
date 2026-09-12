# Motion

Motion components use `@humanspeak/svelte-motion` for interaction and presence behavior. Shared timing and spring definitions live in `src/lib/motion/presets.ts`.

## Choosing a primitive

Use `AnimatedButton` and `AnimatedCard` for small feedback, `Reveal` for viewport entry, `MotionList` for keyed rows, `Presence` for mount/exit transitions, `Magnetic` for pointer attraction, `TextLoop` for rotating phrases, `Marquee` for repeated content, and `Counter` for finite numeric transitions.

## Motion prop reference

| Component | Public controls | Defaults |
| --- | --- | --- |
| `AnimatedButton` | `variant`, `size`, `type`, `disabled`, `animated`, `onclick`, `children` | Same variants and sizes as `Button`; `animated=true`, `type='button'`. |
| `AnimatedCard` | `padding`, `interactive`, `children` | `padding='md'`, `interactive=false`. |
| `Reveal` | `delay`, `children` | `delay=0` seconds. |
| `MotionList` | `items: { id, title, description? }[]`, `label` | `label='Animated list'`; IDs must be stable. |
| `Presence` | `present`, `children` | `present=false`; exit completes before removal. |
| `Magnetic` | `strength`, `maxOffset`, `disabled`, `children` | `strength=.16`, `maxOffset=12`, `disabled=false`; mouse pointer only. |
| `TextLoop` | `texts`, `interval`, `label` | `interval=2200` ms, `label='Rotating text'`; requires at least one phrase. |
| `Marquee` | `items`, `speed`, `direction`, `label` | `speed=22` seconds, `direction='left'`, `label='Scrolling content'`. |
| `Counter` | `value`, `from`, `duration`, `locale` | `from=0`, `duration=700` ms, browser locale. |

Motion components expose content and state through normal Svelte props; there is no provider beyond the optional app-level `MotionConfig` boundary. Use `animated={false}` or `disabled` where a local interaction must remain still while preserving the component’s semantics.

## Reduced motion

The app root sets `MotionConfig reducedMotion="user"`. The foundation stylesheet also shortens CSS animation and transition durations when the user requests reduced motion. Components with timers or continuous loops pause or avoid starting work under reduced motion where appropriate.

Do not make motion the only way to discover state. Provide the same content and controls without movement.

## SSR and performance

Keep browser-only pointer, viewport, and animation setup inside component lifecycle boundaries. Prefer short lists, stable keys, and one motion wrapper per interaction region. Canvas and continuous effects have additional guidance in [Canvas and visual effects](18-canvas-effects.md).
