"""Purge Wendigo Authentik objects via Django ORM (ak shell).

Usage: docker compose exec -T authentik-worker ak shell < prune-wendigo-authentik-ak.py
"""

import json

from django.contrib.contenttypes.models import ContentType
from django.db import transaction

counts: dict[str, int] = {}


def bump(key: str, n: int) -> None:
    counts[key] = counts.get(key, 0) + n


WENDIGO_FLOW_SLUGS = frozenset(
    {
        "wendigo-authentication",
        "wendigo-google-enrollment",
        "wendigo-provider-authorization",
        "wendigo-provider-invalidation",
        "wendigo-source-authentication",
    }
)


def wendigo_flow_qs(Flow):
    qs = Flow.objects.filter(slug__in=WENDIGO_FLOW_SLUGS)
    return qs | Flow.objects.filter(slug__startswith="wendigo-")


def delete_queryset(label: str, qs) -> None:
    deleted, _details = qs.delete()
    if deleted:
        bump(label, deleted)


with transaction.atomic():
    from authentik.core.models import Application
    from authentik.crypto.models import CertificateKeyPair
    from authentik.flows.models import Flow, FlowStageBinding
    from authentik.policies.expression.models import ExpressionPolicy
    from authentik.policies.models import PolicyBinding
    from authentik.providers.oauth2.models import OAuth2Provider
    from authentik.sources.oauth.models import OAuthSource
    from authentik.stages.identification.models import IdentificationStage
    from authentik.stages.prompt.models import PromptField, PromptStage
    from authentik.stages.user_login.models import UserLoginStage
    from authentik.stages.user_write.models import UserWriteStage

    delete_queryset("applications", Application.objects.filter(slug="wendigo"))
    delete_queryset("providers_oauth2", OAuth2Provider.objects.filter(name__startswith="Wendigo"))
    delete_queryset("sources_oauth", OAuthSource.objects.filter(slug="google"))

    flows = wendigo_flow_qs(Flow)
    flow_ids = [str(pk) for pk in flows.values_list("pk", flat=True)]

    if flow_ids:
        flow_ct = ContentType.objects.get_for_model(Flow)
        delete_queryset(
            "flow_bindings",
            FlowStageBinding.objects.filter(target__pk__in=flow_ids),
        )
        delete_queryset(
            "policy_bindings",
            PolicyBinding.objects.filter(
                target_content_type=flow_ct,
                target_object_id__in=flow_ids,
            ),
        )

    for _ in range(6):
        flows = wendigo_flow_qs(Flow)
        if not flows.exists():
            break
        flow_ids = [str(pk) for pk in flows.values_list("pk", flat=True)]
        if flow_ids:
            flow_ct = ContentType.objects.get_for_model(Flow)
            delete_queryset(
                "flow_bindings",
                FlowStageBinding.objects.filter(target__pk__in=flow_ids),
            )
            delete_queryset(
                "policy_bindings",
                PolicyBinding.objects.filter(
                    target_content_type=flow_ct,
                    target_object_id__in=flow_ids,
                ),
            )
        delete_queryset("flows", flows)

    delete_queryset(
        "policies_expression",
        ExpressionPolicy.objects.filter(name__startswith="Wendigo"),
    )
    delete_queryset(
        "stages_user_login",
        UserLoginStage.objects.filter(name__startswith="Wendigo"),
    )
    delete_queryset(
        "stages_identification",
        IdentificationStage.objects.filter(name__startswith="Wendigo"),
    )
    delete_queryset(
        "stages_prompt",
        PromptStage.objects.filter(name__startswith="Wendigo"),
    )
    delete_queryset(
        "stages_user_write",
        UserWriteStage.objects.filter(name__startswith="Wendigo"),
    )
    delete_queryset(
        "prompt_fields",
        PromptField.objects.filter(name__startswith="wendigo-"),
    )

    try:
        from authentik.core.models import PropertyMapping

        delete_queryset(
            "property_mappings",
            PropertyMapping.objects.filter(name__startswith="Wendigo"),
        )
    except Exception:
        try:
            from authentik.providers.oauth2.models import ScopeMapping

            delete_queryset(
                "scope_mappings",
                ScopeMapping.objects.filter(name__startswith="Wendigo"),
            )
        except Exception:
            pass
        try:
            from authentik.sources.oauth.models import OAuthSourcePropertyMapping

            delete_queryset(
                "oauth_mappings",
                OAuthSourcePropertyMapping.objects.filter(name__startswith="Wendigo"),
            )
        except Exception:
            pass

    delete_queryset(
        "certificates",
        CertificateKeyPair.objects.filter(name__startswith="Wendigo"),
    )

print(json.dumps({"pruned": counts, "total": sum(counts.values())}))
