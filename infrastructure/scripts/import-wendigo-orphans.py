#!/usr/bin/env python3
"""Importe dans Pulumi les flows Wendigo déjà présents dans Authentik (orphelins hors état).

Usage: import-wendigo-orphans.py --url http://localhost:9000 --token <API_TOKEN>
Exécuter depuis infrastructure/ (répertoire du stack Pulumi).
"""

from __future__ import annotations

import argparse
import json
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


def fetch_flow_pk(base_url: str, token: str, slug: str) -> str | None:
    url = f"{base_url.rstrip('/')}/api/v3/flows/instances/?slug={slug}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError:
        return None

    if not isinstance(payload, dict):
        return None
    results = payload.get("results") or []
    if not results:
        return None
    pk = results[0].get("pk")
    return str(pk) if pk else None


def pulumi_urns() -> set[str]:
    proc = subprocess.run(
        ["pulumi", "stack", "--show-urns"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        return set()
    return set(proc.stdout.splitlines())


def resource_in_state(urns: set[str], resource_name: str) -> bool:
    suffix = f"::{resource_name}"
    return any(line.rstrip().endswith(suffix) for line in urns)


def import_flow(resource_name: str, pk: str) -> bool:
    proc = subprocess.run(
        ["pulumi", "import", "-y", PULUMI_FLOW_TYPE, resource_name, pk],
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
    print(f"imported {resource_name} <- {pk}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:9000")
    parser.add_argument("--token", required=True)
    args = parser.parse_args()

    urns = pulumi_urns()
    imported = 0

    for resource_name, slug in FLOW_IMPORTS:
        if resource_in_state(urns, resource_name):
            continue
        pk = fetch_flow_pk(args.url, args.token, slug)
        if not pk:
            continue
        if import_flow(resource_name, pk):
            imported += 1
            urns = pulumi_urns()

    print(json.dumps({"imported": imported}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
