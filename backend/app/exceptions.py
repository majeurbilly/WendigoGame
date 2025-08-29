"""
Exceptions personnalisées pour Wendigo Game
"""


class WendigoException(Exception):
    """Exception de base pour Wendigo Game"""
    pass


class GameError(WendigoException):
    """Erreur liée à la gestion des jeux"""
    pass


class PlayerError(WendigoException):
    """Erreur liée à la gestion des joueurs"""
    pass


class RoleError(WendigoException):
    """Erreur liée à la gestion des rôles"""
    pass


class ActionError(WendigoException):
    """Erreur liée aux actions de jeu"""
    pass


class VoteError(WendigoException):
    """Erreur liée au système de vote"""
    pass


class PhaseError(WendigoException):
    """Erreur liée à la gestion des phases"""
    pass


class WebSocketError(WendigoException):
    """Erreur liée aux WebSockets"""
    pass


class AuthenticationError(WendigoException):
    """Erreur d'authentification"""
    pass


class AuthorizationError(WendigoException):
    """Erreur d'autorisation"""
    pass


class ValidationError(WendigoException):
    """Erreur de validation des données"""
    pass


class DatabaseError(WendigoException):
    """Erreur de base de données"""
    pass


class ConfigurationError(WendigoException):
    """Erreur de configuration"""
    pass
