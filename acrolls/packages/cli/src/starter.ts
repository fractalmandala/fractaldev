/**
 * The starter `index.md` shared by `onboard`'s content step and `acrolls docs init` (P10, scoped
 * by D7) — one constant so the displayed snippet and the written file can never drift. `index.md`
 * seeds the corpus because it maps to the docs base route and infers its title from the folder;
 * the rejected `BLANK.md` idea would junk-route and fail authored mode's title requirement.
 */
export const DOCS_STARTER_INDEX_MD = `---
title: Documentation
description: The documentation home
---

# Documentation

Your first Acrolls documentation page.
`;
