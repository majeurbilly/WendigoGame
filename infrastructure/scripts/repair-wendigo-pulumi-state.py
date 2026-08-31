#!/usr/bin/env python3
"""Répare l'état Pulumi vs Authentik : supprime les imports default_* et les orphelins API.

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

PROVIDER_RESOURCE_NAME = "wendigo-authentik"


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

    def delete_flow(self, pk: str) -> bool:
        try:
            self._request("DELETE", f"/api/v3/flows/instances/{pk}/")
            return True
        except urllib.error.HTTPError as err:
            if err.code in (404, 204):
                return False
            raise


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


def repair_flow(
    resource_name: str,
    slug: str,
    client: AuthentikClient,
    provider_urn: str,
    urn_lines: list[str],
) -> tuple[int, list[str]]:
    """Retourne (actions, urn_lines) — actions: 0=rien, 1=state, 2=state+api."""
    actions = 0
    resource_urn = find_resource_urn(urn_lines, resource_name)
    exported = export_resource(resource_name) if resource_urn else None
    assigned = str(exported.get("provider", "")) if exported else None
    misassigned = resource_urn and provider_needs_repair(assigned, provider_urn)

    api_pk: str | None = None
    try:
        api_pk = client.flow_pk_by_slug(slug)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as err:
        print(f"api lookup {slug} failed: {err}", file=sys.stderr)

    if misassigned and resource_urn:
        if delete_from_state(resource_urn):
            actions = 1
            urn_lines = pulumi_urn_lines()
            resource_urn = None

    # Flow présent en API (orphelin ou mal assigné) → supprimer DB + état.
    if api_pk is not None:
        resource_urn = find_resource_urn(urn_lines, resource_name)
        if resource_urn:
            if delete_from_state(resource_urn):
                actions = max(actions, 1)
                urn_lines = pulumi_urn_lines()
        try:
            if client.delete_flow(api_pk):
                print(f"api deleted flow {slug} ({api_pk})")
                actions = max(actions, 2)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as err:
            print(f"api delete {slug} failed: {err}", file=sys.stderr)
        return actions, urn_lines

    # Entrée d'état sans ressource API (refresh échouerait sur ID stale).
    resource_urn = find_resource_urn(urn_lines, resource_name)
    if resource_urn:
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
    urn_lines = pulumi_urn_lines()
    state_fixes = 0
    api_fixes = 0

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
        if actions >= 1:
            state_fixes += 1
        if actions >= 2:
            api_fixes += 1

    print(json.dumps({"state_fixes": state_fixes, "api_fixes": api_fixes}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
