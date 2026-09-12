#!/usr/bin/env python3
"""Validate the machine-readable Svelte skill routing manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def fail(message: str) -> None:
	 raise ValueError(message)


def strings(value: Any, label: str, minimum: int = 1) -> None:
	if not isinstance(value, list) or len(value) < minimum or not all(isinstance(item, str) and item for item in value):
		fail(f"{label}: expected a list of non-empty strings")


def main() -> int:
	parser = argparse.ArgumentParser()
	parser.add_argument("--routing", required=True, type=Path)
	parser.add_argument("--skills-root", required=True, type=Path)
	args = parser.parse_args()

	manifest = json.loads(args.routing.read_text(encoding="utf-8"))
	if set(manifest) != {"contractVersion", "entrySkills", "precedence", "policies", "routes"}:
		fail("manifest: unexpected or missing top-level keys")
	if manifest["contractVersion"] != "1.0":
		fail("manifest.contractVersion: expected '1.0'")

	entry_skills = manifest["entrySkills"]
	strings(entry_skills, "entrySkills")
	precedence = manifest["precedence"]
	if precedence != ["workspace-agents", "svelte-boss", "entry-skill", "required-skills", "conditional-skills"]:
		fail("precedence: unexpected order")

	policies = manifest["policies"]
	policy_keys = {
		"externalSass",
		"allowComponentStyleBlocks",
		"allowInlineStyles",
		"allowClassDirectives",
		"allowFallbackHexColors",
		"allowImplicitDependencyInstallation",
	}
	if set(policies) != policy_keys or not all(isinstance(value, bool) for value in policies.values()):
		fail("policies: expected the six boolean policy keys")

	def skill_exists(skill: str, label: str) -> None:
		if not (args.skills_root / skill / "SKILL.md").is_file():
			fail(f"{label}: skill does not resolve: {skill}")

	for skill in entry_skills:
		skill_exists(skill, "entrySkills")

	routes = manifest["routes"]
	if not isinstance(routes, list) or not routes:
		fail("routes: expected a non-empty list")

	seen: set[str] = set()
	for index, route in enumerate(routes):
		label = f"routes[{index}]"
		if set(route) != {"id", "match", "entrySkill", "required", "conditional"}:
			fail(f"{label}: unexpected or missing keys")
		if not isinstance(route["id"], str) or not route["id"] or route["id"] in seen:
			fail(f"{label}.id: expected a unique non-empty string")
		seen.add(route["id"])
		strings(route["match"], f"{label}.match")
		if route["entrySkill"] not in entry_skills:
			fail(f"{label}.entrySkill: must be an entry skill")
		skill_exists(route["entrySkill"], f"{label}.entrySkill")
		strings(route["required"], f"{label}.required")
		for skill in route["required"]:
			skill_exists(skill, f"{label}.required")
		if not isinstance(route["conditional"], list):
			fail(f"{label}.conditional: expected a list")
		for conditional_index, conditional in enumerate(route["conditional"]):
			conditional_label = f"{label}.conditional[{conditional_index}]"
			if set(conditional) != {"when", "skills"}:
				fail(f"{conditional_label}: unexpected or missing keys")
			if not isinstance(conditional["when"], str) or not conditional["when"]:
				fail(f"{conditional_label}.when: expected a non-empty string")
			strings(conditional["skills"], f"{conditional_label}.skills")
			for skill in conditional["skills"]:
				skill_exists(skill, f"{conditional_label}.skills")

	print(f"PASS: validated {len(routes)} Svelte skill routes and {len(entry_skills)} entry skills")
	return 0


if __name__ == "__main__":
	try:
		raise SystemExit(main())
	except (OSError, ValueError, json.JSONDecodeError) as exc:
		raise SystemExit(f"FAIL: {exc}") from exc
