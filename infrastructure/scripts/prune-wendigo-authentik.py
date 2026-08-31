#!/usr/bin/env python3
"""Supprime la config Wendigo dans Authentik (orphelins hors état Pulumi).

Usage: prune-wendigo-authentik.py --url http://localhost:9000 --token <API_TOKEN>
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

WENDIGO_FLOW_SLUGS = frozenset(
    {
        "wendigo-authentication",
        "wendigo-google-enrollment",
        "wendigo-provider-authorization",
        "wendigo-provider-invalidation",
        "wendigo-source-authentication",
    }
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
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = resp.read().decode()
                return json.loads(body) if body else None
        except urllib.error.HTTPError as err:
            if err.code == 404:
                return None
            raise

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
            next_url = next_path.replace(self.base, "", 1) if next_path.startswith(self.base) else next_path
        return items

    def delete(self, path: str) -> bool:
        try:
            self._request("DELETE", path)
            return True
        except urllib.error.HTTPError as err:
            if err.code in (404, 204):
                return False
            raise


def item_pk(item: dict) -> str | None:
    for key in ("pk", "pbinding_uuid", "fsb_uuid", "pm_uuid"):
        value = item.get(key)
        if value:
            return str(value)
    return None


def name_is_wendigo(name: str | None) -> bool:
    return bool(name and name.startswith("Wendigo"))


def slug_is_wendigo(slug: str | None) -> bool:
    if not slug:
        return False
    return slug in WENDIGO_FLOW_SLUGS or slug.startswith("wendigo")


def flow_is_wendigo(flow: dict) -> bool:
    return slug_is_wendigo(flow.get("slug")) or name_is_wendigo(flow.get("name"))


def prune(client: AuthentikClient) -> dict[str, int]:
    deleted: dict[str, int] = {}

    def bump(label: str, n: int = 1) -> None:
        deleted[label] = deleted.get(label, 0) + n

    def wipe_collection(label: str, path: str, predicate) -> None:
        for item in client.list_paginated(path):
            if not predicate(item):
                continue
            pk = item_pk(item)
            if pk and client.delete(f"{path.rstrip('/')}/{pk}/"):
                bump(label)

    def wendigo_flows() -> list[dict]:
        return [f for f in client.list_paginated("/api/v3/flows/instances/") if flow_is_wendigo(f)]

    def wendigo_policy_pks() -> set[str]:
        return {
            str(p["pk"])
            for p in client.list_paginated("/api/v3/policies/expression/")
            if p.get("pk") and name_is_wendigo(p.get("name"))
        }

    def delete_bindings_for_flow(flow_pk: str) -> None:
        encoded = urllib.parse.quote(flow_pk, safe="")
        for binding in client.list_paginated(f"/api/v3/flows/bindings/?target={encoded}"):
            pk = item_pk(binding)
            if pk and client.delete(f"/api/v3/flows/bindings/{pk}/"):
                bump("flow_bindings")
        for binding in client.list_paginated(f"/api/v3/policies/bindings/?target={encoded}"):
            pk = item_pk(binding)
            if pk and client.delete(f"/api/v3/policies/bindings/{pk}/"):
                bump("policy_bindings")

    def delete_wendigo_flows() -> None:
        # Plusieurs passes : bindings résiduels peuvent bloquer la suppression.
        for _ in range(6):
            flows = wendigo_flows()
            if not flows:
                break
            for flow in flows:
                flow_pk = flow.get("pk")
                if not flow_pk:
                    continue
                delete_bindings_for_flow(str(flow_pk))
                if client.delete(f"/api/v3/flows/instances/{flow_pk}/"):
                    bump("flows")

    # 1. Application + provider + source
    wipe_collection(
        "applications",
        "/api/v3/core/applications/",
        lambda i: i.get("slug") == "wendigo" or name_is_wendigo(i.get("name")),
    )
    wipe_collection(
        "providers_oauth2",
        "/api/v3/providers/oauth2/",
        lambda i: name_is_wendigo(i.get("name")),
    )
    wipe_collection(
        "sources_oauth",
        "/api/v3/sources/oauth/",
        lambda i: i.get("slug") == "google" or name_is_wendigo(i.get("name")),
    )

    # 2. Bindings globaux (cible flow ou policy Wendigo)
    flow_pks = {str(f["pk"]) for f in wendigo_flows() if f.get("pk")}
    policy_pks = wendigo_policy_pks()

    for binding in client.list_paginated("/api/v3/flows/bindings/"):
        target = str(binding.get("target", ""))
        if target in flow_pks:
            pk = item_pk(binding)
            if pk and client.delete(f"/api/v3/flows/bindings/{pk}/"):
                bump("flow_bindings")

    for binding in client.list_paginated("/api/v3/policies/bindings/"):
        target = str(binding.get("target", ""))
        policy = str(binding.get("policy", ""))
        if target in flow_pks or policy in policy_pks:
            pk = item_pk(binding)
            if pk and client.delete(f"/api/v3/policies/bindings/{pk}/"):
                bump("policy_bindings")

    # 3. Flows Wendigo (multi-passe)
    delete_wendigo_flows()

    # 4. Stages & policies
    for label, path in (
        ("stages_user_login", "/api/v3/stages/user_login/"),
        ("stages_identification", "/api/v3/stages/identification/"),
        ("stages_prompt", "/api/v3/stages/prompt/stages/"),
        ("stages_user_write", "/api/v3/stages/user_write/"),
        ("policies_expression", "/api/v3/policies/expression/"),
    ):
        wipe_collection(label, path, lambda i: name_is_wendigo(i.get("name")))

    wipe_collection(
        "prompt_fields",
        "/api/v3/stages/prompt/prompts/",
        lambda i: str(i.get("name", "")).startswith("wendigo-"),
    )

    # 5. Property mappings + certificats
    wipe_collection(
        "scope_mappings",
        "/api/v3/propertymappings/provider/scope/",
        lambda i: name_is_wendigo(i.get("name")),
    )
    wipe_collection(
        "oauth_mappings",
        "/api/v3/propertymappings/source/oauth/",
        lambda i: name_is_wendigo(i.get("name")),
    )
    wipe_collection(
        "certificates",
        "/api/v3/crypto/certificatekeypairs/",
        lambda i: name_is_wendigo(i.get("name")),
    )

    return deleted


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:9000")
    parser.add_argument("--token", required=True)
    args = parser.parse_args()

    client = AuthentikClient(args.url, args.token)
    try:
        counts = prune(client)
    except urllib.error.URLError as err:
        print(f"prune failed: {err}", file=sys.stderr)
        return 1

    total = sum(counts.values())
    print(json.dumps({"pruned": counts, "total": total}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
