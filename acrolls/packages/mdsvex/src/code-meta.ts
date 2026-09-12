export type FenceMeta = {
  filename?: string;
  lineNumbers: boolean;
  wrap: boolean;
  highlight: Set<number>;
  focus: Set<number>;
  add: Set<number>;
  remove: Set<number>;
  raw: string;
};

const RANGE = /^(\d+)(?:-(\d+))?$/;

export function parseRangeList(value: string | undefined): Set<number> {
  const out = new Set<number>();
  if (!value?.trim()) return out;
  for (const part of value.split(',')) {
    const token = part.trim();
    if (!token) continue;
    const m = token.match(RANGE);
    if (!m) {
      throw new Error(`Invalid line range "${token}" in fence metadata`);
    }
    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : start;
    if (end < start) {
      throw new Error(`Invalid descending range "${token}" in fence metadata`);
    }
    for (let i = start; i <= end; i++) out.add(i);
  }
  return out;
}

/**
 * Parse fence meta string.
 * Supports: filename="x" lineNumbers wrap highlight="1,3-5" focus="..." add="..." remove="..."
 */
export function parseFenceMeta(meta: string | null | undefined): FenceMeta {
  const raw = meta?.trim() ?? '';
  const result: FenceMeta = {
    lineNumbers: false,
    wrap: false,
    highlight: new Set(),
    focus: new Set(),
    add: new Set(),
    remove: new Set(),
    raw
  };
  if (!raw) return result;

  const filename = raw.match(/filename=(?:"([^"]+)"|'([^']+)'|(\S+))/);
  if (filename) {
    result.filename = filename[1] ?? filename[2] ?? filename[3];
  }

  if (/\blineNumbers\b/.test(raw)) result.lineNumbers = true;
  if (/\bwrap\b/.test(raw)) result.wrap = true;

  const pick = (key: string) => {
    const m = raw.match(new RegExp(`${key}=(?:"([^"]+)"|'([^']+)'|(\\S+))`));
    return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
  };

  result.highlight = parseRangeList(pick('highlight'));
  result.focus = parseRangeList(pick('focus'));
  result.add = parseRangeList(pick('add'));
  result.remove = parseRangeList(pick('remove'));

  return result;
}
