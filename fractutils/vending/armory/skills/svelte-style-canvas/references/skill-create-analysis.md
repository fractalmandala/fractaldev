# skill-create analysis — svelte-style-canvas

**Source:** `/Users/amrit/mandala/packages/fractal-agentic/skills/svelte-style-canvas`  
**Date:** 2026-08-10  
**Mode:** `/skill-create from <existing-skill-path>` (package + host install, not greenfield git-pattern extraction)

## Git evidence

| Commit | Subject |
| --- | --- |
| `5b9e0e390` | feat(fractal-agentic): add svelte-style-canvas skill |
| `87d293dc1` | merge: feat/fractal-agentic-svelte-style-canvas |

Co-changed with: `packages/fractal-agentic/skills/INDEX.md`, handoff note.

## Detected package shape

```
svelte-style-canvas/
  SKILL.md           # agent contract
  USERDOCS.md        # human guide
  assets/preview-template.html
  references/style-pack-schema.md
  references/related-skills.md
```

## Validation

- Frontmatter: `name` + `description` present, kebab-case name
- Description is trigger-rich (style preview, canvas prototype, playground, /svelte-style-canvas)
- Progressive disclosure: schema + template in references/assets
- Deliverable convention: `vendors/style-previews/` (gitignored)

## Outputs of this skill-create run

1. Restored/confirmed `USERDOCS.md` beside `SKILL.md`
2. Linked USERDOCS from SKILL.md + monorepo path note for Grok installs
3. Packaged `dist/svelte-style-canvas.skill`
4. Installed project skill: `.grok/skills/svelte-style-canvas/`

## Recommended usage

- Plugin/path: `packages/fractal-agentic/skills/svelte-style-canvas/SKILL.md`
- Grok auto-load: `.grok/skills/svelte-style-canvas` (this repo)
- Distribute: `packages/fractal-agentic/skills/svelte-style-canvas/dist/svelte-style-canvas.skill`

## Instincts (optional, not generated)

No continuous-learning-v2 instincts written (`--instincts` not requested).
