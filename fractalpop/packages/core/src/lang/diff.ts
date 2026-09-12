/** diff / patch — line-annotation preset. Colors added/removed/hunk/meta lines. */
import type { ParseOptions } from '../core.js'
import type { ParsedLine } from '../shared.js'

export const annotateLine = (line: ParsedLine): void => {
  let annotation = ''
  if (line.value.startsWith('+') && !line.value.startsWith('+++')) annotation = 'diff-add'
  else if (line.value.startsWith('-') && !line.value.startsWith('---')) annotation = 'diff-remove'
  else if (line.value.startsWith('@@')) annotation = 'diff-hunk'
  else if (/^(diff --git|index |--- |\+\+\+ )/.test(line.value)) {
    annotation = 'diff-meta'
    for (const token of line.tokens) {
      if (token.type === 'property') token.type = 'identifier'
    }
  }
  if (annotation) line.annotations.push(annotation)
}

export const config: ParseOptions = { annotateLine }
