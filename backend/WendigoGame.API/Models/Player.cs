

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Classe Player qui hérite de Character selon le diagramme UML
    /// </summary>
    public class Player : Character
    {
        /// <summary>
        /// Nom du joueur selon le diagramme UML
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// ID de l'utilisateur (pour l'authentification)
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// ID de la partie à laquelle le joueur participe
        /// </summary>
        public string GameId { get; set; } = string.Empty;

        /// <summary>
        /// ID de la connexion SignalR
        /// </summary>
        public string? ConnectionId { get; set; }

        /// <summary>
        /// Indique si le joueur est connecté
        /// </summary>
        public bool IsConnected { get; set; } = false;

        /// <summary>
        /// Date de dernière connexion
        /// </summary>
        public DateTime? LastConnectedAt { get; set; }

        /// <summary>
        /// Votes du joueur (accusations)
        /// </summary>
        public List<Vote> Votes { get; set; } = new();

        /// <summary>
        /// Actions effectuées par le joueur
        /// </summary>
        public List<PlayerAction> Actions { get; set; } = new();

        /// <summary>
        /// Messages envoyés par le joueur
        /// </summary>
        public List<GameMessage> Messages { get; set; } = new();

        /// <summary>
        /// Notes personnelles du joueur
        /// </summary>
        public List<PlayerNote> Notes { get; set; } = new();

        /// <summary>
        /// Méthode GetName() selon le diagramme UML
        /// </summary>
        /// <returns>Le nom du joueur</returns>
        public string GetName()
        {
            return Name;
        }

        /// <summary>
        /// Vérifie si le joueur peut voter
        /// </summary>
        /// <param name="phase">Phase actuelle du jeu</param>
        /// <returns>True si le joueur peut voter</returns>
        public bool CanVote(GamePhase phase)
        {
            return IsAlive && IsReady && IsConnected && 
                   (phase == GamePhase.Evening || phase == GamePhase.Day);
        }

        /// <summary>
        /// Vérifie si le joueur peut sélectionner une chaise
        /// </summary>
        /// <param name="phase">Phase actuelle du jeu</param>
        /// <param name="timeRemaining">Temps restant dans la phase</param>
        /// <returns>True si le joueur peut sélectionner une chaise</returns>
        public bool CanSelectChair(GamePhase phase, int timeRemaining)
        {
            return IsAlive && IsReady && IsConnected && 
                   phase == GamePhase.Day && 
                   timeRemaining <= 120; // 2 dernières minutes (120 secondes)
        }

        /// <summary>
        /// Vérifie si le joueur peut utiliser son pouvoir
        /// </summary>
        /// <param name="phase">Phase actuelle du jeu</param>
        /// <returns>True si le joueur peut utiliser son pouvoir</returns>
        public bool CanUsePower(GamePhase phase)
        {
            return IsAlive && IsReady && IsConnected && 
                   Role.ActionPhase == phase;
        }

        /// <summary>
        /// Ajoute un vote
        /// </summary>
        /// <param name="targetPlayerId">ID du joueur ciblé</param>
        /// <param name="voteType">Type de vote</param>
        public void AddVote(string targetPlayerId, VoteType voteType)
        {
            Vote vote = new Vote
            {
                Id = Guid.NewGuid().ToString(),
                VoterId = Id,
                TargetPlayerId = targetPlayerId,
                VoteType = voteType,
                Timestamp = DateTime.UtcNow
            };
            
            Votes.Add(vote);
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Ajoute une action
        /// </summary>
        /// <param name="actionType">Type d'action</param>
        /// <param name="targetPlayerId">ID du joueur ciblé (optionnel)</param>
        /// <param name="data">Données supplémentaires</param>
        public void AddAction(PlayerActionType actionType, string? targetPlayerId = null, Dictionary<string, object>? data = null)
        {
            PlayerAction action = new PlayerAction
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = Id,
                ActionType = actionType,
                TargetPlayerId = targetPlayerId,
                Data = data ?? new Dictionary<string, object>(),
                Timestamp = DateTime.UtcNow
            };
            
            Actions.Add(action);
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Ajoute un message
        /// </summary>
        /// <param name="content">Contenu du message</param>
        /// <param name="messageType">Type de message</param>
        public void AddMessage(string content, MessageType messageType)
        {
            GameMessage message = new GameMessage
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = Id,
                Content = content,
                MessageType = messageType,
                Timestamp = DateTime.UtcNow
            };
            
            Messages.Add(message);
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Met à jour le statut de connexion
        /// </summary>
        /// <param name="isConnected">Statut de connexion</param>
        /// <param name="connectionId">ID de connexion SignalR</param>
        public void UpdateConnectionStatus(bool isConnected, string? connectionId = null)
        {
            IsConnected = isConnected;
            ConnectionId = connectionId;
            LastConnectedAt = isConnected ? DateTime.UtcNow : LastConnectedAt;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Tue le joueur
        /// </summary>
        public void Die()
        {
            IsAlive = false;
            IsReady = false;
            SelectedChair = null;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Ressuscite le joueur
        /// </summary>
        public void Resurrect()
        {
            IsAlive = true;
            IsReady = true;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Représentation string du joueur
        /// </summary>
        public override string ToString()
        {
            return $"{Name} - {Role.Name} (Team: {Team}, Alive: {IsAlive}, Connected: {IsConnected})";
        }
    }
}
