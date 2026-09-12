/**
 * Route path data with rounded elbows — the open-polyline twin of the render
 * package's `roundedPath.ts` (paint only; the polyline stays the geometry of record).
 */

type Point = [number, number];

const MIN_TURN = 1e-6;
const MIN_RADIUS = 0.01;

function f3(v: number): number {
  return Number.parseFloat(v.toFixed(3));
}
function angleTo(from: Point, to: Point): number {
  return Math.atan2(to[0] - from[0], to[1] - from[1]);
}
function isSharpTurn(deg: number): boolean {
  return (deg < 0 && deg >= -180) || (deg > 180 && deg < 360);
}

function roundCorner(prev: Point, corner: Point, next: Point, radius: number) {
  const toPrev = angleTo(corner, prev);
  const toNext = angleTo(corner, next);
  const between = toNext - toPrev;
  if (Math.abs(Math.sin(between)) < MIN_TURN) return undefined;
  const leg = Math.min(
    Math.hypot(prev[0] - corner[0], prev[1] - corner[1]),
    Math.hypot(next[0] - corner[0], next[1] - corner[1]),
  );
  const r = Math.min(radius, Math.abs((leg / 2) * Math.tan(between / 2)));
  if (r < MIN_RADIUS) return undefined;
  const sweep = isSharpTurn(between * (180 / Math.PI)) ? 0 : 1;
  let offset = r / Math.tan(between / 2);
  if (!Number.isFinite(offset)) offset = r;
  return {
    start: [corner[0] + Math.sin(toPrev) * offset, corner[1] + Math.cos(toPrev) * offset] as Point,
    end: [corner[0] + Math.sin(toNext) * offset, corner[1] + Math.cos(toNext) * offset] as Point,
    radius: r,
    sweep,
  };
}

/** SVG path data for a route; radius 0 emits the bare polyline. */
export function toPathData(points: Point[], radius = 6): string {
  const first = points[0];
  if (!first) return '';
  const parts: string[] = [`M${f3(first[0])} ${f3(first[1])}`];
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i]!;
    const corner =
      i === points.length - 1 ? undefined : roundCorner(points[i - 1]!, point, points[i + 1]!, radius);
    if (!corner) {
      parts.push(`L${f3(point[0])} ${f3(point[1])}`);
      continue;
    }
    parts.push(
      `L${f3(corner.start[0])} ${f3(corner.start[1])}`,
      `A${f3(corner.radius)} ${f3(corner.radius)} 0 0 ${corner.sweep} ${f3(corner.end[0])} ${f3(corner.end[1])}`,
    );
  }
  return parts.join('');
}
