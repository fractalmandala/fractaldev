# Changelog

## 0.3.1 (2026-09-10)

- Added `repository`, `homepage`, and `bugs` fields to package.json
- Replaced badge-markdown `description` with a plain-text summary
- Fixed `sideEffects` to `false` (no CSS is shipped)
- Added `engines: { "node": ">=18" }` field
- Added test suite for the generate pipeline (`node --test`)
- Duplicate export detection now errors and exits non-zero

## 0.3.0 (2026-09-08)

- **Breaking**: Single-module-per-family architecture (99.9% file reduction — from ~55,000 files to 59)
- Added fill variants: `phosphorfill`, `tablerfill`, `iconoirfill`, `remixfill`, `heroiconsfill`, `boxsolid`
- Added `--prune` step to clean dist of stray files (`.DS_Store`, `.zip`)

## 0.2.0 (2026-09-08)

- Expanded to 25 icon families

## 0.1.0 (2026-09-05)

- Added `coreui` and `famicons` families

## 0.0.3 (2026-08-28)

- Cleanup pass

## 0.0.2 (2026-08-16)

- Initial release — 11 families
