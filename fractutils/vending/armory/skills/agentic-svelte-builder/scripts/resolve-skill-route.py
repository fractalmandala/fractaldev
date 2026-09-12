#!/usr/bin/env python3
"""Resolve a short Svelte request to the smallest entry/required skill lane."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


STOPWORDS = {"a", "an", "the", "this", "to", "for", "with", "and", "or", "my", "it", "in", "on"}


def tokens(value: str) -> set[str]:
	return {token for token in re.findall(r"[a-z0-9]+", value.casefold()) if token not in STOPWORDS}


def match_score(prompt: str, phrase: str) -> int:
	prompt_tokens = tokens(prompt)
	phrase_tokens = tokens(phrase)
	if not phrase_tokens.issubset(prompt_tokens):
		return 0
	return len(phrase_tokens) * 10 + (5 if phrase.casefold() in prompt.casefold() else 0)


def resolve(manifest: dict[str, Any], prompt: str) -> dict[str, Any]:
	best: tuple[int, dict[str, Any], str] | None = None
	for route in manifest["routes"]:
		for phrase in route["match"]:
			score = match_score(prompt, phrase)
			if score and (best is None or score > best[0]):
				best = (score, route, phrase)
	if best is None:
		raise ValueError(f"no Svelte skill route matched: {prompt!r}")

	score, route, phrase = best
	return {
		"prompt": prompt,
		"route": route["id"],
		"entrySkill": route["entrySkill"],
		"required": route["required"],
		"conditionalCandidates": route["conditional"],
		"matchedPhrase": phrase,
		"score": score,
	}


def main() -> int:
	parser = argparse.ArgumentParser()
	parser.add_argument("--routing", required=True, type=Path)
	parser.add_argument("--prompt")
	parser.add_argument("--cases", type=Path)
	args = parser.parse_args()
	if bool(args.prompt) == bool(args.cases):
		raise ValueError("provide exactly one of --prompt or --cases")

	manifest = json.loads(args.routing.read_text(encoding="utf-8"))
	if args.prompt:
		print(json.dumps(resolve(manifest, args.prompt), indent=2))
		return 0

	cases = json.loads(args.cases.read_text(encoding="utf-8"))
	if not isinstance(cases, list) or not cases:
		raise ValueError("cases: expected a non-empty JSON list")
	for index, case in enumerate(cases):
		if set(case) != {"prompt", "route"}:
			raise ValueError(f"cases[{index}]: expected prompt and route")
		result = resolve(manifest, case["prompt"])
		if result["route"] != case["route"]:
			raise ValueError(f"cases[{index}]: expected {case['route']}, got {result['route']}")
		print(f"PASS: {case['prompt']} -> {result['route']}")
	print(f"PASS: resolved {len(cases)} short-prompt routing cases")
	return 0


if __name__ == "__main__":
	try:
		raise SystemExit(main())
	except (OSError, ValueError, json.JSONDecodeError) as exc:
		raise SystemExit(f"FAIL: {exc}") from exc
