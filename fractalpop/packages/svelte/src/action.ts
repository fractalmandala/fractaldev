/** `use:fractalpop` — highlight an element's text content on the client.
 * For dynamic/client-only code where you don't have the string at build time. */
import { highlight, type HighlightOptions } from 'fractalpop/full'

export function fractalpop(node: HTMLElement, options: HighlightOptions = {}) {
  const source = node.textContent ?? ''
  const run = (opts: HighlightOptions) => {
    node.innerHTML = `<code>${highlight(source, opts)}</code>`
  }
  run(options)
  return {
    update(opts: HighlightOptions) {
      run(opts)
    },
  }
}
