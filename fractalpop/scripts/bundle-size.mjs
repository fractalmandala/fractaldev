#!/usr/bin/env node
/**
 * Bundle-size gate for fractalpop core.
 *
 * Builds `packages/core`, measures the gzip size of each published bundle,
 * and exits with code 1 if any bundle exceeds its threshold.
 *
 * No minifier (esbuild/terser) is installed in the root workspace, so sizes
 * are computed by gzipping the already-built files directly. Thresholds are
 * therefore approximate; the gate is intentionally conservative.
 */
import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const coreDist = join(root, 'packages', 'core', 'dist')

const bundles = [
  { name: 'index.js', file: 'index.js', threshold: 5 * 1024 },
  { name: 'full.js', file: 'full.js', threshold: 15 * 1024 },
  { name: 'gpu.js', file: 'gpu.js', threshold: 35 * 1024 },
]

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(2)} KiB`
}

function buildCore() {
  console.log('Building packages/core...')
  execSync('pnpm --filter fractalpop run build', {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
}

function measure(filePath) {
  const raw = readFileSync(filePath)
  const gzipped = gzipSync(raw)
  return gzipped.length
}

buildCore()

console.log('\nBundle sizes (gzip, approximate because no minifier is installed):')
console.log('─'.repeat(60))
console.log(`${'Bundle'.padEnd(12)} ${'Size'.padEnd(12)} ${'Threshold'.padEnd(12)} Status`)
console.log('─'.repeat(60))

let failed = false
for (const bundle of bundles) {
  const filePath = join(coreDist, bundle.file)
  if (!existsSync(filePath)) {
    console.log(
      `${bundle.name.padEnd(12)} ${'missing'.padEnd(12)} ${formatBytes(bundle.threshold).padEnd(12)} skipped`,
    )
    continue
  }

  const size = measure(filePath)
  const ok = size < bundle.threshold
  const status = ok ? 'ok' : 'FAIL'
  if (!ok) failed = true

  console.log(
    `${bundle.name.padEnd(12)} ${formatBytes(size).padEnd(12)} ${formatBytes(bundle.threshold).padEnd(12)} ${status}`,
  )
}

console.log('─'.repeat(60))

if (failed) {
  console.error('\nBundle-size threshold exceeded.')
  process.exit(1)
}

console.log('\nAll bundle sizes within thresholds.')
