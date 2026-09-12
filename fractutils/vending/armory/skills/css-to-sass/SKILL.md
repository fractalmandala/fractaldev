---
name: css-to-sass
description: Converts CSS or SCSS styling into valid single-tab indented indented SASS. Invoke when the user provides CSS/SCSS and asks for SASS conversion or formatted styling output.
---

# CSS to SASS

Convert provided CSS or SCSS into pure indented SASS syntax.

## Output contract

Always return:

- `.sass` syntax, never SCSS.
- Single-tab indented per level nesting.
- No curly braces `{}`.
- No semicolons `;`.
- No unnecessary blank lines inside a selector block.
- Preserve selector order and declaration order unless conversion requires a structural change.
- Preserve comments unless the user asks to remove them.
- Preserve CSS custom properties exactly, including their `--` names.
- Preserve vendor prefixes, at-rules, pseudo-selectors, combinators, and media queries.
- Return a fenced code block with the `sass` language tag unless the user asks for another format.

## Conversion rules

### Selectors and declarations

Convert:

```css
.card {
  color: red;
  padding: 1rem;
}
```

to:

```sass
.card
    color: red
    padding: 1rem
```

### Nested selectors

Convert nested CSS selectors into indentation:

```css
.card:hover {
  color: blue;
}

.card .title {
  font-weight: 700;
}
```

to:

```sass
.card
    &:hover
        color: blue
    .title
        font-weight: 700
```

Use `&` when the nested selector refers to the parent selector. Preserve a descendant selector as a nested child when Sass semantics produce the same selector.

### Multiple selectors

Keep comma-separated selectors together unless splitting them is required for valid Sass semantics:

```sass
.card, .panel
    padding: 1rem
```

### At-rules

Nest declarations and selectors below at-rules with tabs:

```css
@media (min-width: 768px) {
  .card {
    padding: 2rem;
  }
}
```

becomes:

```sass
@media (min-width: 768px)
    .card
		    padding: 2rem
```

Preserve `@font-face`, `@keyframes`, `@supports`, `@container`, `@layer`, and other at-rules. For keyframes, indent percentage/keyframe selectors below the at-rule.

### Pseudo-elements and pseudo-classes

Preserve them exactly and use `&` where needed:

```sass
.button
    &::before
        content: ""
    &:focus-visible
        outline: 2px solid currentColor
```

### CSS nesting and Sass parent references

Convert CSS nesting to Sass nesting. Do not invent variables, mixins, functions, placeholders, or abstractions that were not present in the input.

### SCSS variables and interpolation

Preserve valid Sass variables and interpolation:

```scss
$gap: 1rem;
.card {
  gap: $gap;
}
```

becomes:

```sass
$gap: 1rem

.card
    gap: $gap
```

### Maps, lists, and complex values

Do not alter declaration values unless required to remove SCSS punctuation. Preserve commas, parentheses, brackets, URLs, strings, gradients, calculations, and CSS functions exactly.

### Mixins and includes

Convert SCSS mixin syntax to indented Sass syntax:

```scss
@mixin interactive {
  cursor: pointer;
}
.button {
  @include interactive;
}
```

to:

```sass
@mixin interactive
    cursor: pointer

.button
    +interactive
```

Preserve mixin arguments when present.

### Functions and control flow

Preserve valid Sass functions and control-flow directives, converting braces and semicolons to indentation:

```sass
@if $enabled
    color: red
@else
    color: gray
```

Do not translate CSS into a different styling system such as Tailwind.

## Validation checklist

Before returning output, verify:

1. No `{` or `}` characters remain.
2. No semicolons remain, except inside quoted strings or URLs where removing them would change a value.
3. Every nested block uses exactly one additional tab level.
4. No spaces are used for indentation.
5. Every selector block and at-rule has valid indented Sass children.
6. Parent selectors use `&` where necessary.
7. Values and selector semantics remain unchanged.
8. The result is pure indented `.sass`, not `.scss`.

If the input is ambiguous or invalid, state the ambiguity briefly and provide the closest valid indented-Sass conversion without silently changing the intended styling.

## Response style

Return the converted Sass first. Add only concise notes when a conversion required a semantic decision or when the input contained invalid CSS/SCSS.
