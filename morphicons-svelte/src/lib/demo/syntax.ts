type TokenKind =
  | "attr"
  | "comment"
  | "component"
  | "function"
  | "keyword"
  | "number"
  | "operator"
  | "property"
  | "punctuation"
  | "string"
  | "tag"
  | "variable";

const KEYWORDS = new Set([
  "as",
  "const",
  "else",
  "export",
  "from",
  "if",
  "import",
  "let",
  "new",
  "return",
  "type",
]);

const LITERALS = new Set(["false", "null", "true", "undefined"]);

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

function token(kind: TokenKind, value: string): string {
  return `<span class="code-token code-token-${kind}">${escapeHtml(value)}</span>`;
}

function isIdentifierStart(character: string | undefined): boolean {
  return character !== undefined && /[A-Za-z_$]/.test(character);
}

function isIdentifierPart(character: string | undefined): boolean {
  return character !== undefined && /[A-Za-z0-9_$:-]/.test(character);
}

function readIdentifier(source: string, start: number): string {
  let end = start + 1;
  while (isIdentifierPart(source[end])) end += 1;
  return source.slice(start, end);
}

function readString(source: string, start: number, quote: string): string {
  let end = start + 1;
  while (end < source.length) {
    if (source[end] === "\\") {
      end += 2;
      continue;
    }
    if (source[end] === quote) {
      end += 1;
      break;
    }
    end += 1;
  }
  return source.slice(start, end);
}

function nextNonWhitespace(source: string, start: number): string | undefined {
  let index = start;
  while (/\s/.test(source[index] ?? "")) index += 1;
  return source[index];
}

/**
 * A deliberately small, escaped Svelte/TypeScript highlighter for the docs page.
 * It returns HTML because the source is rendered inside a code block with {@html}.
 */
export function highlightSvelte(source: string): string {
  const output: string[] = [];
  let index = 0;
  let inTag = false;
  let expectingTagName = false;

  while (index < source.length) {
    if (source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      const finish = end === -1 ? source.length : end + 3;
      output.push(token("comment", source.slice(index, finish)));
      index = finish;
      continue;
    }

    if (source.startsWith("//", index)) {
      const end = source.indexOf("\n", index + 2);
      const finish = end === -1 ? source.length : end;
      output.push(token("comment", source.slice(index, finish)));
      index = finish;
      continue;
    }

    if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      const finish = end === -1 ? source.length : end + 2;
      output.push(token("comment", source.slice(index, finish)));
      index = finish;
      continue;
    }

    const character = source[index];

    if (inTag) {
      if (character === '"' || character === "'" || character === "`") {
        const value = readString(source, index, character);
        output.push(token("string", value));
        index += value.length;
        continue;
      }

      if (source.startsWith("/>", index)) {
        output.push(token("punctuation", "/>"));
        index += 2;
        inTag = false;
        expectingTagName = false;
        continue;
      }

      if (character === ">") {
        output.push(token("punctuation", character));
        index += 1;
        inTag = false;
        expectingTagName = false;
        continue;
      }

      if (isIdentifierStart(character)) {
        const value = readIdentifier(source, index);
        const kind: TokenKind = expectingTagName
          ? /^[A-Z]/.test(value)
            ? "component"
            : "tag"
          : "attr";
        output.push(token(kind, value));
        index += value.length;
        expectingTagName = false;
        continue;
      }

      if (character === "=" || character === "{" || character === "}") {
        output.push(token("operator", character));
      } else if (/[()[\].,:?]/.test(character)) {
        output.push(token("punctuation", character));
      } else {
        output.push(escapeHtml(character));
      }
      index += 1;
      continue;
    }

    if (
      character === "<" &&
      (source[index + 1] === "/" || isIdentifierStart(source[index + 1]))
    ) {
      const closing = source[index + 1] === "/";
      const marker = closing ? "</" : "<";
      output.push(token("punctuation", marker));
      index += marker.length;
      inTag = true;
      expectingTagName = true;
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      const value = readString(source, index, character);
      output.push(token("string", value));
      index += value.length;
      continue;
    }

    if (isIdentifierStart(character)) {
      const value = readIdentifier(source, index);
      let kind: TokenKind = "property";
      if (KEYWORDS.has(value)) kind = "keyword";
      else if (LITERALS.has(value)) kind = "number";
      else if (value.startsWith("$")) kind = "variable";
      else if (nextNonWhitespace(source, index + value.length) === "(") {
        kind = "function";
      }
      output.push(token(kind, value));
      index += value.length;
      continue;
    }

    if (/\d/.test(character)) {
      const match = source.slice(index).match(/^\d+(?:\.\d+)?/);
      const value = match?.[0] ?? character;
      output.push(token("number", value));
      index += value.length;
      continue;
    }

    const operator = source.slice(index).match(/^(?:===|!==|=>|==|!=|&&|\|\||[=!?:+*/%-])/);
    if (operator) {
      output.push(token("operator", operator[0]));
      index += operator[0].length;
      continue;
    }

    if (/[()[\]{},.;:.]/.test(character)) {
      output.push(token("punctuation", character));
      index += 1;
      continue;
    }

    output.push(escapeHtml(character));
    index += 1;
  }

  return output.join("");
}
