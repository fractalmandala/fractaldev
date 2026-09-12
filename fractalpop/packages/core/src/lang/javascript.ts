/** JavaScript / JSX — the JS runtime with heuristic TS detection (JSX on by default). */
import { tokenize as tokenizeJs } from '../presets/javascript-runtime.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = {
  tokenize: (code, options) => tokenizeJs(code, options),
}
