/** Maps language ids to their parse configs, and resolves a config by name. */
import type { ParseOptions } from '../core.js'

import { config as typescript } from '../lang/typescript.js'
import { config as javascript } from '../lang/javascript.js'
import { config as css } from '../lang/css.js'
import { config as scss } from '../lang/scss.js'
import { config as sass } from '../lang/sass.js'
import { config as html } from '../lang/html.js'
import { config as svelte } from '../lang/svelte.js'
import { config as markdown } from '../lang/markdown.js'
import { config as diff } from '../lang/diff.js'
import { config as plaintext } from '../lang/plaintext.js'

import { config as c } from '../lang/c.js'
import { config as cpp } from '../lang/cpp.js'
import { config as csharp } from '../lang/csharp.js'
import { config as dockerfile } from '../lang/dockerfile.js'
import { config as go } from '../lang/go.js'
import { config as graphql } from '../lang/graphql.js'
import { config as hcl } from '../lang/hcl.js'
import { config as java } from '../lang/java.js'
import { config as json } from '../lang/json.js'
import { config as kotlin } from '../lang/kotlin.js'
import { config as lua } from '../lang/lua.js'
import { config as php } from '../lang/php.js'
import { config as powershell } from '../lang/powershell.js'
import { config as python } from '../lang/python.js'
import { config as ruby } from '../lang/ruby.js'
import { config as rust } from '../lang/rust.js'
import { config as shell } from '../lang/shell.js'
import { config as sql } from '../lang/sql.js'
import { config as swift } from '../lang/swift.js'
import { config as toml } from '../lang/toml.js'
import { config as yaml } from '../lang/yaml.js'
import { config as zig } from '../lang/zig.js'

export const configs: Record<string, ParseOptions> = {
  typescript,
  javascript,
  css,
  scss,
  sass,
  html,
  svelte,
  markdown,
  diff,
  plaintext,
  c,
  cpp,
  csharp,
  dockerfile,
  go,
  graphql,
  hcl,
  java,
  json,
  kotlin,
  lua,
  php,
  powershell,
  python,
  ruby,
  rust,
  shell,
  sql,
  swift,
  toml,
  yaml,
  zig,
}

export function configFor(name?: string): ParseOptions {
  return configs[name || 'typescript'] ?? configs.plaintext!
}
