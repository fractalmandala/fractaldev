<script lang="ts">
  import { highlight, type HighlightOptions, type MarkLine } from 'fractalpop/full'

  interface Props extends HighlightOptions {
    code?: string
    /** 1-based line numbers to mark with `fp__line--highlighted`. */
    highlightLines?: number[]
    class?: string
    codeClass?: string
  }

  let {
    code = '',
    lang = 'typescript',
    highlightLines = [],
    cx,
    class: className = '',
    codeClass = '',
    ...rest
  }: Props = $props()

  const lineSet = $derived(new Set(highlightLines))
  const html = $derived(
    highlight(code, {
      lang,
      cx,
      markLine: lineSet.size
        ? (line: MarkLine) => {
            if (lineSet.has(line.index + 1)) line.className += ' fp__line--highlighted'
          }
        : undefined,
    }),
  )
</script>

<pre class={`fp ${className}`.trim()} {...rest}><code class={codeClass}>{@html html}</code></pre>
