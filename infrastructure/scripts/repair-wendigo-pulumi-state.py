#!/usr/bin/env python3
"""Répare l'état Pulumi vs Authentik : imports default_*, import des orphelins API.

Usage: repair-wendigo-pulumi-state.py --url http://localhost:9000 --token <API_TOKEN>
Exécuter depuis infrastructure/ (répertoire du stack Pulumi).
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request

# (nom ressource Pulumi, slug Authentik)
FLOW_TARGETS: tuple[tuple[str, str], ...] = (
    ("wendigo-authentication", "wendigo-authentication"),
    ("wendigo-google-enrollment", "wendigo-google-enrollment"),
    ("wendigo-provider-authorization-flow", "wendigo-provider-authorization"),
    ("wendigo-provider-invalidation-flow", "wendigo-provider-invalidation"),
    ("wendigo-source-authentication-flow", "wendigo-source-authentication"),
)

FLOW_RESOURCE_TYPE = "authentik:index/flow:Flow"
PROVIDER_RESOURCE_NAME = "wendigo-authentik"

# Ressources souvent liées au provider default_* (DecodePropertyMap au refresh/up).
MISASSIGNED_CLEANUP_NAMES: tuple[str, ...] = (
    "wendigo-google-auth-login",
    "wendigo-google-enrollment-login",
    "wendigo-google-source-auth-login",
    "wendigo-openid-scope",
)


class AuthentikClient:
    def __init__(self, base_url: str, token: str) -> None:
        self.base = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        }

    def _request(self, method: str, path: str) -> dict | list | None:
        url = f"{self.base}{path}"
        req = urllib.request.Request(url, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode()
                return json.loads(body) if body else None
        except urllib.error.HTTPError as err:
            if err.code in (404, 204):
                return None
            raise

    def flow_pk_by_slug(self, slug: str) -> str | None:
        payload = self._request("GET", f"/api/v3/flows/instances/?slug={slug}")
        if not isinstance(payload, dict):
            return None
        results = payload.get("results") or []
        if not results:
            return None
        pk = results[0].get("pk")
        return str(pk) if pk else None

    def list_paginated(self, path: str) -> list[dict]:
        items: list[dict] = []
        sep = "&" if "?" in path else "?"
        next_url: str | None = f"{path}{sep}page_size=100"
        while next_url:
            payload = self._request("GET", next_url)
            if not isinstance(payload, dict):
                break
            items.extend(payload.get("results", []))
            next_path = payload.get("next")
            if not next_path:
                break
            next_url = (
                next_path.replace(self.base, "", 1)
                if next_path.startswith(self.base)
                else next_path
            )
        return items

    @staticmethod
    def item_pk(item: dict) -> str | None:
        for key in ("pk", "pbinding_uuid", "fsb_uuid", "pm_uuid"):
            value = item.get(key)
            if value:
                return str(value)
        return None

    def delete_bindings_for_flow(self, flow_pk: str) -> None:
        for binding in self.list_paginated("/api/v3/flows/bindings/"):
            if str(binding.get("target", "")) != flow_pk:
                continue
            pk = self.item_pk(binding)
            if pk:
                self._request("DELETE", f"/api/v3/flows/bindings/{pk}/")
        for binding in self.list_paginated("/api/v3/policies/bindings/"):
            if str(binding.get("target", "")) != flow_pk:
                continue
            pk = self.item_pk(binding)
            if pk:
                self._request("DELETE", f"/api/v3/policies/bindings/{pk}/")

    def delete_flow(self, pk: str, slug: str) -> bool:
        for _ in range(3):
            self.delete_bindings_for_flow(pk)
            try:
                self._request("DELETE", f"/api/v3/flows/instances/{pk}/")
            except urllib.error.HTTPError as err:
                if err.code in (404, 204):
                    return self.flow_pk_by_slug(slug) is None
                if err.code in (400, 409, 500):
                    continue
                raise
            if self.flow_pk_by_slug(slug) is None:
                return True
        return self.flow_pk_by_slug(slug) is None

    def wipe_oauth_providers(self) -> int:
        deleted = 0
        for item in self.list_paginated("/api/v3/providers/oauth2/"):
            name = str(item.get("name", ""))
            client_id = str(item.get("client_id", ""))
            if not (name.startswith("Wendigo") or client_id in ("wendigo-dev", "wendigo")):
                continue
            pk = item.get("pk")
            if not pk:
                continue
            try:
                self._request("DELETE", f"/api/v3/providers/oauth2/{pk}/")
                deleted += 1
            except urllib.error.HTTPError as err:
                if err.code not in (404, 204):
                    raise
        return deleted

    def wipe_applications(self) -> int:
        deleted = 0
        for item in self.list_paginated("/api/v3/core/applications/"):
            if item.get("slug") != "wendigo" and not str(item.get("name", "")).startswith("Wendigo"):
                continue
            pk = item.get("pk")
            if pk:
                try:
                    self._request("DELETE", f"/api/v3/core/applications/{pk}/")
                    deleted += 1
                except urllib.error.HTTPError:
                    pass
        return deleted


def pulumi_urn_lines() -> list[str]:
    proc = subprocess.run(
        ["pulumi", "stack", "--show-urns"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return []
    return proc.stdout.splitlines()


def find_resource_urn(urn_lines: list[str], resource_name: str) -> str | None:
    suffix = f"::{resource_name}"
    for line in urn_lines:
        stripped = line.strip()
        if stripped.startswith("urn:") and stripped.endswith(suffix):
            return stripped
    match = re.search(
        rf"(urn:pulumi:[^\s]+::[^\s]+::{re.escape(resource_name)})\s*$",
        "\n".join(urn_lines),
        re.MULTILINE,
    )
    if match:
        return match.group(1)
    exported = export_resource(resource_name)
    if exported:
        urn = str(exported.get("urn", ""))
        if urn:
            return urn
    return None


def authentik_provider_urn() -> str | None:
    proc = subprocess.run(
        ["pulumi", "stack", "--show-urns"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return None
    match = re.search(
        r"urn:pulumi:[^ \n]+::pulumi:providers:authentik::wendigo-authentik",
        proc.stdout,
    )
    return match.group(0) if match else None


def export_resource(resource_name: str) -> dict | None:
    proc = subprocess.run(
        ["pulumi", "stack", "export"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return None
    try:
        state = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None
    for res in state.get("deployment", {}).get("resources", []):
        urn = str(res.get("urn", ""))
        if urn.endswith(f"::{resource_name}"):
            return res
    return None


def provider_needs_repair(provider_urn: str | None, expected_provider_urn: str) -> bool:
    if not provider_urn:
        return True
    if provider_urn == expected_provider_urn:
        return False
    return "default_" in provider_urn or PROVIDER_RESOURCE_NAME not in provider_urn


def delete_from_state(resource_urn: str) -> bool:
    proc = subprocess.run(
        ["pulumi", "state", "delete", "--force", "-y", resource_urn],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(
            f"state delete {resource_urn} failed: {proc.stderr or proc.stdout}",
            file=sys.stderr,
        )
        return False
    print(f"state deleted {resource_urn}")
    return True


def cleanup_default_providers(expected_provider_urn: str) -> int:
    deleted = 0
    for line in pulumi_urn_lines():
        stripped = line.strip()
        if not stripped.startswith("urn:pulumi:"):
            continue
        if "::pulumi:providers:authentik::" not in stripped:
            continue
        if stripped == expected_provider_urn or stripped.endswith(f"::{PROVIDER_RESOURCE_NAME}"):
            continue
        if delete_from_state(stripped):
            deleted += 1
    return deleted


def cleanup_misassigned_resources(
    provider_urn: str,
    urn_lines: list[str],
) -> tuple[int, list[str]]:
    deleted = 0
    names = MISASSIGNED_CLEANUP_NAMES + tuple(r[0] for r in FLOW_TARGETS)
    for resource_name in names:
        resource_urn = find_resource_urn(urn_lines, resource_name)
        if not resource_urn:
            continue
        exported = export_resource(resource_name)
        assigned = str(exported.get("provider", "")) if exported else ""
        if not provider_needs_repair(assigned, provider_urn):
            continue
        if delete_from_state(resource_urn):
            deleted += 1
            urn_lines = pulumi_urn_lines()
    return deleted, urn_lines


def import_flow_to_state(resource_name: str, api_pk: str, provider_urn: str) -> bool:
    proc = subprocess.run(
        [
            "pulumi",
            "import",
            "-y",
            "--skip-preview",
            "--provider",
            provider_urn,
            FLOW_RESOURCE_TYPE,
            resource_name,
            api_pk,
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(
            f"import {resource_name} failed: {proc.stderr or proc.stdout}",
            file=sys.stderr,
        )
        return False
    print(f"state imported {resource_name} ({api_pk})")
    return True


def repair_flow(
    resource_name: str,
    slug: str,
    client: AuthentikClient,
    provider_urn: str,
    urn_lines: list[str],
) -> tuple[int, list[str]]:
    """Retourne (actions, urn_lines) — 0=rien, 1=state, 2=api delete, 3=import."""
    actions = 0
    resource_urn = find_resource_urn(urn_lines, resource_name)
    exported = export_resource(resource_name) if resource_urn else None
    assigned = str(exported.get("provider", "")) if exported else ""
    misassigned = bool(resource_urn and provider_needs_repair(assigned, provider_urn))

    api_pk: str | None = None
    try:
        api_pk = client.flow_pk_by_slug(slug)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as err:
        print(f"api lookup {slug} failed: {err}", file=sys.stderr)

    if resource_urn and not misassigned and api_pk is not None:
        return 0, urn_lines

    if misassigned and resource_urn:
        if delete_from_state(resource_urn):
            actions = 1
            urn_lines = pulumi_urn_lines()
            resource_urn = None

    resource_urn = find_resource_urn(urn_lines, resource_name)

    # Orphelin API → import (évite slug already exists au pulumi up).
    if api_pk is not None and not resource_urn:
        if import_flow_to_state(resource_name, api_pk, provider_urn):
            return max(actions, 3), pulumi_urn_lines()
        if client.delete_flow(api_pk, slug):
            print(f"api deleted flow {slug} ({api_pk})")
            return max(actions, 2), pulumi_urn_lines()
        return actions, urn_lines

    # Entrée état fantôme (absente côté API).
    if resource_urn and api_pk is None:
        if delete_from_state(resource_urn):
            actions = max(actions, 1)
            urn_lines = pulumi_urn_lines()

    return actions, urn_lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:9000")
    parser.add_argument("--token", required=True)
    args = parser.parse_args()

    provider_urn = authentik_provider_urn()
    if not provider_urn:
        print("provider wendigo-authentik introuvable — réparation ignorée", file=sys.stderr)
        print(json.dumps({"repaired": 0, "skipped": True}))
        return 0

    client = AuthentikClient(args.url, args.token)
    apps = client.wipe_applications()
    providers = client.wipe_oauth_providers()
    if apps or providers:
        print(f"api wiped applications={apps} providers={providers}")

    provider_cleaned = cleanup_default_providers(provider_urn)
    if provider_cleaned:
        print(f"state deleted default providers={provider_cleaned}")

    urn_lines = pulumi_urn_lines()
    misassigned_cleaned, urn_lines = cleanup_misassigned_resources(provider_urn, urn_lines)
    if misassigned_cleaned:
        print(f"state deleted misassigned resources={misassigned_cleaned}")

    state_fixes = misassigned_cleaned + provider_cleaned
    api_fixes = 0
    import_fixes = 0

    for resource_name, slug in FLOW_TARGETS:
        try:
            actions, urn_lines = repair_flow(
                resource_name,
                slug,
                client,
                provider_urn,
                urn_lines,
            )
        except Exception as err:  # noqa: BLE001
            print(f"repair {resource_name} failed: {err}", file=sys.stderr)
            continue
        if actions == 1:
            state_fixes += 1
        elif actions == 2:
            api_fixes += 1
        elif actions >= 3:
            import_fixes += 1

    print(
        json.dumps(
            {
                "state_fixes": state_fixes,
                "api_fixes": api_fixes,
                "import_fixes": import_fixes,
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
