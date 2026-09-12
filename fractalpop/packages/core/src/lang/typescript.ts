/** TypeScript / TSX — the JS runtime with the TS keyword set forced on. */
import { tokenize as tokenizeJs } from '../presets/javascript-runtime.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = {
  tokenize: (code, options) => tokenizeJs(code, { ...options, typescript: true }),
}
