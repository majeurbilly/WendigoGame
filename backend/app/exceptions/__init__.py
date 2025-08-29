"""
Exceptions Wendigo
Initialisation des exceptions personnalisées
"""

from .exceptions import WendigoException, GameError, PlayerError, UserError, RoleError, ActionError, VoteError, PhaseError, WebSocketError, AuthenticationError, AuthorizationError, ValidationError, DatabaseError, ConfigurationError, ChatError

__all__ = [
    "WendigoException",
    "GameError",
    "PlayerError",
    "UserError",
    "RoleError",
    "ActionError",
    "VoteError",
    "PhaseError",
    "WebSocketError",
    "AuthenticationError",
    "AuthorizationError",
    "ValidationError",
    "DatabaseError",
    "ConfigurationError",
    "ChatError"
]
