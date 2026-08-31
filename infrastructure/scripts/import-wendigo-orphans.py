#!/usr/bin/env python3
"""Importe dans Pulumi les flows Wendigo déjà présents dans Authentik (orphelins hors état).

Usage: import-wendigo-orphans.py --url http://localhost:9000 --token <API_TOKEN>
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
FLOW_IMPORTS: tuple[tuple[str, str], ...] = (
    ("wendigo-authentication", "wendigo-authentication"),
    ("wendigo-google-enrollment", "wendigo-google-enrollment"),
    ("wendigo-provider-authorization-flow", "wendigo-provider-authorization"),
    ("wendigo-provider-invalidation-flow", "wendigo-provider-invalidation"),
    ("wendigo-source-authentication-flow", "wendigo-source-authentication"),
)

PULUMI_FLOW_TYPE = "authentik:index/flow:Flow"
PROVIDER_RESOURCE_NAME = "wendigo-authentik"


def fetch_flow_pk(base_url: str, token: str, slug: str) -> str | None:
    url = f"{base_url.rstrip('/')}/api/v3/flows/instances/?slug={slug}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode())
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    if not isinstance(payload, dict):
        return None
    results = payload.get("results") or []
    if not results:
        return None
    pk = results[0].get("pk")
    return str(pk) if pk else None


def pulumi_urn_lines() -> list[str]:
    proc = subprocess.run(
        ["pulumi", "stack", "--show-urns"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        return []
    return proc.stdout.splitlines()


def find_resource_urn(urn_lines: list[str], resource_name: str) -> str | None:
    suffix = f"::{resource_name}"
    for line in urn_lines:
        stripped = line.strip()
        if stripped.startswith("urn:") and stripped.endswith(suffix):
            return stripped
    match = re.search(
        rf"(urn:pulumi:[^\s]+::flow:Flow::{re.escape(resource_name)})",
        "\n".join(urn_lines),
    )
    return match.group(1) if match else None


def authentik_provider_urn(urn_lines: list[str] | None = None) -> str | None:
    text = "\n".join(urn_lines) if urn_lines is not None else ""
    if not text:
        proc = subprocess.run(
            ["pulumi", "stack", "--show-urns"],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            return None
        text = proc.stdout
    match = re.search(
        r"urn:pulumi:[^ \n]+::pulumi:providers:authentik::wendigo-authentik",
        text,
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
        ["pulumi", "state", "delete", "-y", resource_urn],
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


def import_flow(resource_name: str, pk: str, provider_urn: str) -> bool:
    proc = subprocess.run(
        [
            "pulumi",
            "import",
            "-y",
            PULUMI_FLOW_TYPE,
            resource_name,
            pk,
            "--provider",
            f"authentik={provider_urn}",
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
    print(f"imported {resource_name} <- {pk} (provider {PROVIDER_RESOURCE_NAME})")
    return True


def repair_misassigned_provider(
    resource_name: str,
    provider_urn: str,
    urn_lines: list[str],
) -> tuple[bool, list[str]]:
    """Supprime de l'état les imports assignés au provider default_* (sans appel API)."""
    resource_urn = find_resource_urn(urn_lines, resource_name)
    if not resource_urn:
        return False, urn_lines
    exported = export_resource(resource_name)
    assigned_provider = str(exported.get("provider", "")) if exported else None
    if not provider_needs_repair(assigned_provider, provider_urn):
        return False, urn_lines
    if delete_from_state(resource_urn):
        return True, pulumi_urn_lines()
    return False, urn_lines


def reconcile_flow(
    resource_name: str,
    slug: str,
    base_url: str,
    token: str,
    provider_urn: str,
    urn_lines: list[str],
) -> tuple[int, list[str]]:
    """0 = rien, 1 = réparé (state delete), 2 = importé."""
    repaired, urn_lines = repair_misassigned_provider(resource_name, provider_urn, urn_lines)
    if repaired:
        resource_urn = find_resource_urn(urn_lines, resource_name)
        if resource_urn:
            exported = export_resource(resource_name)
            assigned = str(exported.get("provider", "")) if exported else None
            if not provider_needs_repair(assigned, provider_urn):
                return 1, urn_lines

    resource_urn = find_resource_urn(urn_lines, resource_name)
    if resource_urn:
        exported = export_resource(resource_name)
        assigned = str(exported.get("provider", "")) if exported else None
        if not provider_needs_repair(assigned, provider_urn):
            return 0, urn_lines

    pk = fetch_flow_pk(base_url, token, slug)
    if not pk:
        return (1 if repaired else 0), urn_lines

    if import_flow(resource_name, pk, provider_urn):
        return 2, pulumi_urn_lines()
    return (1 if repaired else 0), urn_lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:9000")
    parser.add_argument("--token", required=True)
    args = parser.parse_args()

    urn_lines = pulumi_urn_lines()
    provider_urn = authentik_provider_urn(urn_lines)
    if not provider_urn:
        print(
            "authentik provider wendigo-authentik introuvable — import ignoré",
            file=sys.stderr,
        )
        print(json.dumps({"imported": 0, "repaired": 0, "skipped": True}))
        return 0

    imported = 0
    repaired = 0

    for resource_name, slug in FLOW_IMPORTS:
        try:
            outcome, urn_lines = reconcile_flow(
                resource_name,
                slug,
                args.url,
                args.token,
                provider_urn,
                urn_lines,
            )
        except Exception as err:  # noqa: BLE001 — script CI : ne pas bloquer le déploiement
            print(f"reconcile {resource_name} failed: {err}", file=sys.stderr)
            continue
        if outcome >= 1:
            repaired += 1
        if outcome == 2:
            imported += 1

    print(json.dumps({"imported": imported, "repaired": repaired, "provider": PROVIDER_RESOURCE_NAME}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
