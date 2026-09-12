<div class="prose">

# Markdown — `.md`

This page is a plain `.md` file. Because mdsvex is configured for both `.svx`
and `.md`, the exact same `@fractalpop/mdsvex` highlighter colours these fences —
no Svelte syntax required.

```js
export function greet(name) {
  // template strings and comments are highlighted
  return `Hi ${name}`
}
```

## Python

```python
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

## SCSS with a highlighted line

```scss {3}
$brand: #cd6799;
.card {
  color: $brand;
  &:hover { color: darken($brand, 10%); }
}
```

Same tokens, same theme variables, whether the source is `.svelte`, `.svx`, or
`.md`.

</div>