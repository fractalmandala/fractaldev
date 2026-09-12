/** Symbol coloring shared by SCSS and indented Sass: $variables, @at-rules,
 * %placeholders, !flags, and function/mixin calls. Mutates the token array. */
import {
  T_CLASS,
  T_ENTITY,
  T_IDENTIFIER,
  T_KEYWORD,
  T_PROPERTY,
  T_SIGN,
  type Token,
} from '../shared.js'

const isNameType = (type: number): boolean =>
  type === T_IDENTIFIER || type === T_CLASS || type === T_PROPERTY

export function applySassSymbols(tokens: Token[]): void {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    const [type, value] = token

    // $variable — the plain lexer already keeps `$name` as one word token.
    if (isNameType(type) && value[0] === '$') {
      token[0] = T_PROPERTY
      continue
    }

    if (type === T_SIGN) {
      const next = tokens[i + 1]
      // @at-rule: merge '@' + word → keyword (@mixin, @include, @if, @use, …).
      if (value === '@' && next && isNameType(next[0])) {
        tokens.splice(i, 2, [T_KEYWORD, '@' + next[1]])
        continue
      }
      // %placeholder selector: merge '%' + word → class.
      if (value === '%' && next && isNameType(next[0])) {
        tokens.splice(i, 2, [T_CLASS, '%' + next[1]])
        continue
      }
      // !flag: merge '!' + word → keyword (!default, !global, !important, !optional).
      if (value === '!' && next && isNameType(next[0])) {
        tokens.splice(i, 2, [T_KEYWORD, '!' + next[1]])
        continue
      }
    }

    // function / mixin call: a name directly before '(' → entity.
    if (isNameType(type) && value[0] !== '$') {
      const next = tokens[i + 1]
      if (next && next[0] === T_SIGN && next[1] === '(') token[0] = T_ENTITY
    }
  }
}
