

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Entité de jeu principale
    /// </summary>
    public class Game
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string LobbyId { get; set; } = string.Empty;
        public List<Player> Players { get; set; } = new();
        public GameStatus Status { get; set; } = GameStatus.Waiting;
        public GamePhase CurrentPhase { get; set; } = GamePhase.Day;
        public int NbTurn { get; set; } = 0;
        public DateTime PhaseStartTime { get; set; } = DateTime.UtcNow;
        public TimeSpan PhaseDuration { get; set; } = TimeSpan.FromMinutes(10);
        public List<GameEvent> GameEvents { get; set; } = new();
        public List<GameMessage> GameMessages { get; set; } = new();
        public GameSettings Settings { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public string? WinnerTeam { get; set; }
    }

    /// <summary>
    /// Vote d'un joueur
    /// </summary>
    public class Vote
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GameId { get; set; } = string.Empty;
        public string VoterId { get; set; } = string.Empty;
        public string TargetPlayerId { get; set; } = string.Empty;
        public VoteType VoteType { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Action d'un joueur
    /// </summary>
    public class PlayerAction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PlayerId { get; set; } = string.Empty;
        public PlayerActionType ActionType { get; set; }
        public string? TargetPlayerId { get; set; }
        public Dictionary<string, object> Data { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Message de jeu
    /// </summary>
    public class GameMessage
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GameId { get; set; } = string.Empty;
        public string PlayerId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public MessageType MessageType { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Note personnelle d'un joueur
    /// </summary>
    public class PlayerNote
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PlayerId { get; set; } = string.Empty;
        public string TargetPlayerId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Événement de jeu
    /// </summary>
    public class GameEvent
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string GameId { get; set; } = string.Empty;
        public GameEventType EventType { get; set; }
        public string? PlayerId { get; set; }
        public string? TargetPlayerId { get; set; }
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Data { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Paramètres de jeu
    /// </summary>
    public class GameSettings
    {
        public int MinPlayers { get; set; } = 8;
        public int MaxPlayers { get; set; } = 29;
        public TimeSpan DayPhaseDuration { get; set; } = TimeSpan.FromMinutes(10);
        public TimeSpan EveningPhaseDuration { get; set; } = TimeSpan.FromMinutes(5);
        public TimeSpan NightPhaseDuration { get; set; } = TimeSpan.FromMinutes(3);
        public TimeSpan WakeUpPhaseDuration { get; set; } = TimeSpan.FromMinutes(2);
        public bool AllowGhostChat { get; set; } = true;
        public bool AllowWolfChat { get; set; } = true;
        public bool AllowMediumChat { get; set; } = true;
        public bool AllowNotes { get; set; } = true;
        public bool AllowVibration { get; set; } = true;
        public bool AllowNotifications { get; set; } = true;
    }


}
