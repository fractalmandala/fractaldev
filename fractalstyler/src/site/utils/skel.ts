import { snapshotBones } from '$site/utils/skex.js'
import type { ResponsiveBones, SkeletonResult } from '$site/utils/skyp.js'

export type RegisteredBones = SkeletonResult | ResponsiveBones

const bonesRegistry = new Map<string, RegisteredBones>()

export function registerBones(map: Record<string, RegisteredBones>): void {
  for (const [name, bones] of Object.entries(map)) {
    bonesRegistry.set(name, bones)
  }
}

export function getRegisteredBones(name: string): RegisteredBones | undefined {
  return bonesRegistry.get(name)
}

export function ensureBuildSnapshotHook(): void {
  if (typeof window !== 'undefined' && (window as any).__BONEYARD_BUILD) {
    (window as any).__BONEYARD_SNAPSHOT = snapshotBones
  }
}

export function isBuildMode(): boolean {
  return typeof window !== 'undefined' && (window as any).__BONEYARD_BUILD === true
}

export function resolveResponsive(
  bones: RegisteredBones,
  width: number,
): SkeletonResult | null {
  if (!('breakpoints' in bones)) return bones
  const bps = Object.keys(bones.breakpoints).map(Number).sort((a, b) => a - b)
  if (bps.length === 0) return null
  const match = [...bps].reverse().find(bp => width >= bp) ?? bps[0]
  return bones.breakpoints[match] ?? null
}

// ── Animation constants (shared across all framework packages) ──────────────
export const SHIMMER = {
  angle: 110,
  start: 30,
  end: 70,
  speed: '2s',
  lightHighlight: '#f7f7f7',
  darkHighlight: '#2c2c2c',
} as const

export const PULSE = {
  speed: '1.8s',
  /** adjustColor factor for lighter color in pulse animation */
  lightAdjust: 0.3,
  darkAdjust: 0.02,
} as const

export const CONTAINER = {
  adjustment: 0.12,
  darkAdjustment: 0.03,
} as const

// ── Default colors (shared across all framework packages) ─────────────────
export const DEFAULTS = {
  /** Web frameworks: solid opaque bone colors */
  web: {
    light: '#f0f0f0',
    dark: '#222222',
  },
  /** React Native */
  native: {
    light: '#f0f0f0',
    dark: '#222222',
  },
  /** Vanilla runtime (renderBones) */
  runtime: '#f0f0f0',
} as const

// ── Native shimmer constants ──────────────────────────────────────────────
export const NATIVE_SHIMMER = {
  /** Duration in ms for one shimmer sweep (aligned with web SHIMMER.speed) */
  speed: 2000,
  /** Width of shimmer highlight as fraction of bone width */
  widthFraction: 0.4,
  /** Opacity of shimmer highlight overlay */
  opacity: 0.6,
} as const

const RGBA_REGEX = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/

export function adjustColor(color: string, amount: number): string {
  const rgbaMatch = color.match(RGBA_REGEX)
  if (rgbaMatch) {
    const [, r, g, b, a = '1'] = rgbaMatch
    const newAlpha = Math.min(1, parseFloat(a) + amount * 0.5)
    return `rgba(${r},${g},${b},${newAlpha.toFixed(3)})`
  }

  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const nr = Math.round(r + (255 - r) * amount)
      const ng = Math.round(g + (255 - g) * amount)
      const nb = Math.round(b + (255 - b) * amount)
      return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
    }
  }

  return color
}