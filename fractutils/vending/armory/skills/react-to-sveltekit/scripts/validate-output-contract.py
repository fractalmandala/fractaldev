#!/usr/bin/env python3
"""Dependency-free validation for React-to-SvelteKit output-contract fixtures."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ENUMS = {
    "status": {"planned", "complete", "partial", "blocked"},
    "framework": {"react", "next"},
    "source_kind": {"component", "route-component", "page"},
    "target_kind": {"component", "route"},
    "animation": {"none", "framer-motion", "gsap", "css-timer", "canvas-webgl"},
    "load_file": {"none", "+page.ts", "+page.server.ts", "+layout.ts", "+layout.server.ts", "+server.ts", "remote"},
    "serialization": {"not-applicable", "json-serializable"},
    "ssr_mode": {"safe", "browser-effect", "browser-guard", "disabled"},
    "verification_status": {"planned", "passed", "skipped", "failed"},
}


def require_keys(value: dict[str, Any], keys: set[str], label: str) -> None:
    missing = keys - value.keys()
    extra = value.keys() - keys
    if missing:
        raise ValueError(f"{label}: missing {sorted(missing)}")
    if extra:
        raise ValueError(f"{label}: unexpected {sorted(extra)}")


def enum(value: Any, allowed: set[str], label: str) -> None:
    if value not in allowed:
        raise ValueError(f"{label}: {value!r} is not one of {sorted(allowed)}")


def strings(value: Any, label: str, *, min_items: int = 0) -> None:
    if not isinstance(value, list) or len(value) < min_items or not all(isinstance(item, str) and item for item in value):
        raise ValueError(f"{label}: expected a list of non-empty strings")


def validate(manifest: dict[str, Any]) -> None:
    require_keys(
        manifest,
        {"contractVersion", "status", "source", "target", "dependencies", "dataFlow", "ssr", "verification", "gaps"},
        "manifest",
    )
    if manifest["contractVersion"] != "1.0":
        raise ValueError("manifest.contractVersion: expected '1.0'")
    enum(manifest["status"], ENUMS["status"], "manifest.status")

    source = manifest["source"]
    require_keys(source, {"framework", "kind", "files", "route", "animationTier"}, "source")
    enum(source["framework"], ENUMS["framework"], "source.framework")
    enum(source["kind"], ENUMS["source_kind"], "source.kind")
    strings(source["files"], "source.files", min_items=1)
    if source["route"] is not None and not isinstance(source["route"], str):
        raise ValueError("source.route: expected string or null")
    enum(source["animationTier"], ENUMS["animation"], "source.animationTier")

    target = manifest["target"]
    require_keys(target, {"kind", "files", "route", "publicApi"}, "target")
    enum(target["kind"], ENUMS["target_kind"], "target.kind")
    strings(target["files"], "target.files", min_items=1)
    if target["route"] is None:
        if target["kind"] == "route":
            raise ValueError("target.route: route targets require a route object")
    else:
        route = target["route"]
        require_keys(route, {"path", "params", "searchParams"}, "target.route")
        if not isinstance(route["path"], str) or not route["path"]:
            raise ValueError("target.route.path: expected a non-empty string")
        strings(route["params"], "target.route.params")
        strings(route["searchParams"], "target.route.searchParams")
    api = target["publicApi"]
    require_keys(api, {"props", "bindings", "callbacks", "snippets"}, "target.publicApi")
    for key in ("props", "bindings", "callbacks", "snippets"):
        strings(api[key], f"target.publicApi.{key}")

    dependencies = manifest["dependencies"]
    require_keys(dependencies, {"present", "required", "missing", "fallbacks"}, "dependencies")
    for key in dependencies:
        strings(dependencies[key], f"dependencies.{key}")

    data_flow = manifest["dataFlow"]
    require_keys(data_flow, {"loadFile", "reason", "serverData", "actions", "invalidations", "serialization"}, "dataFlow")
    enum(data_flow["loadFile"], ENUMS["load_file"], "dataFlow.loadFile")
    if not isinstance(data_flow["reason"], str) or not data_flow["reason"]:
        raise ValueError("dataFlow.reason: expected a non-empty string")
    for key in ("serverData", "actions", "invalidations"):
        strings(data_flow[key], f"dataFlow.{key}")
    enum(data_flow["serialization"], ENUMS["serialization"], "dataFlow.serialization")

    ssr = manifest["ssr"]
    require_keys(ssr, {"mode", "browserOnlyApis", "guards", "disabledReason"}, "ssr")
    enum(ssr["mode"], ENUMS["ssr_mode"], "ssr.mode")
    strings(ssr["browserOnlyApis"], "ssr.browserOnlyApis")
    strings(ssr["guards"], "ssr.guards")
    if ssr["disabledReason"] is not None and not isinstance(ssr["disabledReason"], str):
        raise ValueError("ssr.disabledReason: expected string or null")
    if ssr["mode"] == "disabled" and not ssr["disabledReason"]:
        raise ValueError("ssr.disabledReason: required when ssr.mode is disabled")
    if ssr["mode"] != "disabled" and ssr["disabledReason"] is not None:
        raise ValueError("ssr.disabledReason: only allowed when ssr.mode is disabled")
    if ssr["browserOnlyApis"] and ssr["mode"] == "safe":
        raise ValueError("ssr.mode: browser APIs require browser-effect, browser-guard, or disabled")
    if ssr["browserOnlyApis"] and not ssr["guards"]:
        raise ValueError("ssr.guards: browser APIs require an explicit guard/effect")

    verification = manifest["verification"]
    if not isinstance(verification, list):
        raise ValueError("verification: expected a list")
    for index, item in enumerate(verification):
        require_keys(item, {"command", "cwd", "purpose", "status", "evidence"}, f"verification[{index}]")
        for key in ("command", "cwd", "purpose"):
            if not isinstance(item[key], str) or not item[key]:
                raise ValueError(f"verification[{index}].{key}: expected a non-empty string")
        enum(item["status"], ENUMS["verification_status"], f"verification[{index}].status")
        if not isinstance(item["evidence"], str):
            raise ValueError(f"verification[{index}].evidence: expected a string")

    strings(manifest["gaps"], "gaps")
    if manifest["status"] == "complete":
        if not verification:
            raise ValueError("complete manifests require verification entries")
        if any(item["status"] not in {"passed", "skipped"} for item in verification):
            raise ValueError("complete manifests cannot contain planned or failed checks")
        if any(item["status"] == "skipped" and not item["evidence"] for item in verification):
            raise ValueError("skipped checks require an evidence/reason")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", required=True, type=Path)
    parser.add_argument("--fixtures", required=True, type=Path)
    parser.add_argument("--invalid-fixtures", type=Path)
    args = parser.parse_args()
    json.loads(args.schema.read_text(encoding="utf-8"))
    files = sorted(args.fixtures.glob("*.json"))
    if not files:
        raise SystemExit(f"no JSON fixtures found in {args.fixtures}")
    for path in files:
        validate(json.loads(path.read_text(encoding="utf-8")))
        print(f"PASS: {path}")
    if args.invalid_fixtures:
        invalid_files = sorted(args.invalid_fixtures.glob("*.json"))
        if not invalid_files:
            raise SystemExit(f"no invalid JSON fixtures found in {args.invalid_fixtures}")
        for path in invalid_files:
            try:
                validate(json.loads(path.read_text(encoding="utf-8")))
            except (ValueError, json.JSONDecodeError):
                print(f"PASS: rejected invalid fixture {path}")
            else:
                raise ValueError(f"invalid fixture unexpectedly passed: {path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(f"FAIL: {exc}") from exc
