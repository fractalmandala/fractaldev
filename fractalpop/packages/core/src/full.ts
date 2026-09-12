/** fractalpop/full — registers all 32 bundled language configs up front. */
import { registerLanguages } from './index.js'
import { languages } from './presets/all-languages.js'

registerLanguages(languages)

export * from './index.js'
