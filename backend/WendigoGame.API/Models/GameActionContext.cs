

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Contexte d'action pour les rôles du jeu
    /// </summary>
    public class GameActionContext
    {
        /// <summary>
        /// ID du joueur qui effectue l'action
        /// </summary>
        public string PlayerId { get; set; } = string.Empty;

        /// <summary>
        /// ID de la partie
        /// </summary>
        public string GameId { get; set; } = string.Empty;

        /// <summary>
        /// Phase actuelle du jeu
        /// </summary>
        public GamePhase CurrentPhase { get; set; }

        /// <summary>
        /// Cible de l'action (si applicable)
        /// </summary>
        public string? TargetPlayerId { get; set; }

        /// <summary>
        /// Numéro de chaise sélectionnée (si applicable)
        /// </summary>
        public int? ChairNumber { get; set; }

        /// <summary>
        /// Message à envoyer (si applicable)
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Données supplémentaires pour l'action
        /// </summary>
        public Dictionary<string, object> AdditionalData { get; set; } = new();

        /// <summary>
        /// Timestamp de l'action
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Résultat d'une action de jeu
    /// </summary>
    public class GameActionResult
    {
        /// <summary>
        /// Indique si l'action a réussi
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Message de résultat
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Données de résultat
        /// </summary>
        public Dictionary<string, object> ResultData { get; set; } = new();

        /// <summary>
        /// Événements déclenchés par cette action
        /// </summary>
        public List<GameEvent> TriggeredEvents { get; set; } = new();

        /// <summary>
        /// Timestamp du résultat
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Crée un résultat de succès
        /// </summary>
        public static GameActionResult SuccessResult(string message = "Action réussie")
        {
            return new GameActionResult
            {
                Success = true,
                Message = message,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Crée un résultat d'échec
        /// </summary>
        public static GameActionResult FailureResult(string message = "Action échouée")
        {
            return new GameActionResult
            {
                Success = false,
                Message = message,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}
