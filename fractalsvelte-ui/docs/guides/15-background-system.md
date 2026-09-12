# Background system

Background selections are independent of the base theme. A user can change from plain to an Aura, Gradient, or Pattern without replacing the selected theme family or accent pair.

## Auras

Each Aura has a base colour and two layers. Each layer retains its background declaration, blend mode, opacity, and responsive blur values. Render both layers; do not flatten them into one colour if you want the preset’s intended depth.

## Gradients

The preset `css` value becomes the `background` declaration directly. It takes precedence over the current plain background while the selection is active.

## Patterns

Patterns may supply `background`, `backgroundColor`, `backgroundImage`, `backgroundSize`, `backgroundPosition`, `backgroundRepeat`, `backgroundAttachment`, and `backgroundBlendMode`. These declarations override the current background where supplied. Keep `backgroundImage` and `backgroundSize` together when the pattern depends on a repeatable tile.

## Classification and contrast

Auras use their explicit `dark` classification. Gradients and patterns are classified from their supplied colours. Classification controls the default browsing filter; it does not prevent a user from choosing All modes. Verify text and focus contrast against the final background, not only against the base palette.
