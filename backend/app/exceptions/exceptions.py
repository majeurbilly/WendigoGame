"""
Exceptions personnalisées pour Wendigo Game
"""


class WendigoException(Exception):
    """Exception de base pour Wendigo Game"""
    
    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class GameError(WendigoException):
    """Erreur liée à la gestion des parties"""
    pass


class PlayerError(WendigoException):
    """Erreur liée à la gestion des joueurs"""
    pass


class UserError(WendigoException):
    """Erreur liée à la gestion des utilisateurs"""
    pass


class RoleError(WendigoException):
    """Erreur liée à la gestion des rôles"""
    pass


class ActionError(WendigoException):
    """Erreur liée à la gestion des actions"""
    pass


class VoteError(WendigoException):
    """Erreur liée à la gestion des votes"""
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


class ChatError(WendigoException):
    """Erreur liée au chat"""
    pass
