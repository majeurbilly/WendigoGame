

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Lobby de jeu pour la préparation des parties
    /// </summary>
    public class Lobby
    {
        /// <summary>
        /// ID unique du lobby
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Nom du lobby
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Description du lobby
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Nombre minimum de joueurs
        /// </summary>
        public int MinPlayers { get; set; } = 8;

        /// <summary>
        /// Nombre maximum de joueurs
        /// </summary>
        public int MaxPlayers { get; set; } = 29;

        /// <summary>
        /// Liste des joueurs dans le lobby
        /// </summary>
        public List<LobbyPlayer> Players { get; set; } = new();

        /// <summary>
        /// Statut du lobby
        /// </summary>
        public LobbyStatus Status { get; set; } = LobbyStatus.Open;

        /// <summary>
        /// ID du créateur du lobby
        /// </summary>
        public string CreatorId { get; set; } = string.Empty;

        /// <summary>
        /// Mot de passe du lobby (optionnel)
        /// </summary>
        public string? Password { get; set; }

        /// <summary>
        /// Messages du lobby
        /// </summary>
        public List<LobbyMessage> Messages { get; set; } = new();

        /// <summary>
        /// Date de création du lobby
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Date de dernière mise à jour
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Date de début de partie (si applicable)
        /// </summary>
        public DateTime? GameStartedAt { get; set; }

        /// <summary>
        /// ID de la partie associée (si applicable)
        /// </summary>
        public string? GameId { get; set; }

        /// <summary>
        /// Vérifie si le lobby est plein
        /// </summary>
        public bool IsFull => Players.Count >= MaxPlayers;

        /// <summary>
        /// Vérifie si le lobby peut démarrer
        /// </summary>
        public bool CanStart => Players.Count >= MinPlayers && 
                               Players.All(p => p.IsReady) && 
                               Status == LobbyStatus.Open;

        /// <summary>
        /// Obtient le nombre de joueurs prêts
        /// </summary>
        public int ReadyPlayersCount => Players.Count(p => p.IsReady);

        /// <summary>
        /// Ajoute un joueur au lobby
        /// </summary>
        public bool AddPlayer(LobbyPlayer player)
        {
            if (IsFull || Status != LobbyStatus.Open)
                return false;

            if (Players.Any(p => p.UserId == player.UserId))
                return false;

            player.LobbyId = Id;
            player.JoinedAt = DateTime.UtcNow;
            Players.Add(player);
            UpdatedAt = DateTime.UtcNow;

            // Ajouter un message système
            AddSystemMessage($"{player.Name} a rejoint le lobby");

            return true;
        }

        /// <summary>
        /// Retire un joueur du lobby
        /// </summary>
        public bool RemovePlayer(string userId)
        {
            LobbyPlayer player = Players.FirstOrDefault(p => p.UserId == userId);
            if (player == null)
                return false;

            Players.Remove(player);
            UpdatedAt = DateTime.UtcNow;

            // Ajouter un message système
            AddSystemMessage($"{player.Name} a quitté le lobby");

            // Si c'était le créateur et qu'il reste des joueurs, transférer la création
            if (CreatorId == userId && Players.Any())
            {
                CreatorId = Players.First().UserId;
                AddSystemMessage($"{Players.First().Name} est maintenant le créateur du lobby");
            }

            return true;
        }

        /// <summary>
        /// Met à jour le statut de prêt d'un joueur
        /// </summary>
        public bool UpdatePlayerReady(string userId, bool isReady)
        {
            LobbyPlayer player = Players.FirstOrDefault(p => p.UserId == userId);
            if (player == null)
                return false;

            player.IsReady = isReady;
            player.UpdatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;

            string status = isReady ? "prêt" : "non prêt";
            AddSystemMessage($"{player.Name} est maintenant {status}");

            return true;
        }

        /// <summary>
        /// Ajoute un message au lobby
        /// </summary>
        public void AddMessage(string userId, string content)
        {
            LobbyPlayer player = Players.FirstOrDefault(p => p.UserId == userId);
            if (player == null)
                return;

            LobbyMessage message = new LobbyMessage
            {
                Id = Guid.NewGuid().ToString(),
                LobbyId = Id,
                UserId = userId,
                PlayerName = player.Name,
                Content = content,
                Timestamp = DateTime.UtcNow
            };

            Messages.Add(message);
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Ajoute un message système
        /// </summary>
        private void AddSystemMessage(string content)
        {
            LobbyMessage message = new LobbyMessage
            {
                Id = Guid.NewGuid().ToString(),
                LobbyId = Id,
                UserId = "system",
                PlayerName = "Système",
                Content = content,
                IsSystemMessage = true,
                Timestamp = DateTime.UtcNow
            };

            Messages.Add(message);
        }

        /// <summary>
        /// Démarre la partie
        /// </summary>
        public bool StartGame(string gameId)
        {
            if (!CanStart)
                return false;

            Status = LobbyStatus.Starting;
            GameId = gameId;
            GameStartedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;

            AddSystemMessage("La partie commence !");

            return true;
        }

        /// <summary>
        /// Ferme le lobby
        /// </summary>
        public void CloseLobby()
        {
            Status = LobbyStatus.Closed;
            UpdatedAt = DateTime.UtcNow;
            AddSystemMessage("Le lobby a été fermé");
        }

        /// <summary>
        /// Obtient un joueur par son ID utilisateur
        /// </summary>
        public LobbyPlayer? GetPlayer(string userId)
        {
            return Players.FirstOrDefault(p => p.UserId == userId);
        }

        /// <summary>
        /// Obtient les messages récents
        /// </summary>
        public List<LobbyMessage> GetRecentMessages(int count = 50)
        {
            return Messages
                .OrderByDescending(m => m.Timestamp)
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// Vérifie si un utilisateur est dans le lobby
        /// </summary>
        public bool ContainsUser(string userId)
        {
            return Players.Any(p => p.UserId == userId);
        }

        /// <summary>
        /// Vérifie si un utilisateur est le créateur
        /// </summary>
        public bool IsCreator(string userId)
        {
            return CreatorId == userId;
        }

        /// <summary>
        /// Vérifie si le lobby est protégé par un mot de passe
        /// </summary>
        public bool IsPasswordProtected()
        {
            return !string.IsNullOrEmpty(Password);
        }

        /// <summary>
        /// Valide le mot de passe du lobby
        /// </summary>
        public bool ValidateLobbyPassword(string password)
        {
            if (!IsPasswordProtected())
                return true; // Pas de mot de passe = accès libre

            return Password == password;
        }
    }

    /// <summary>
    /// Joueur dans un lobby
    /// </summary>
    public class LobbyPlayer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string LobbyId { get; set; } = string.Empty;
        public bool IsReady { get; set; } = false;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Message de lobby
    /// </summary>
    public class LobbyMessage
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string LobbyId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string PlayerName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsSystemMessage { get; set; } = false;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
