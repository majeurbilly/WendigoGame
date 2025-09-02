

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Statistiques d'une partie
    /// </summary>
    public class GameStatistics
    {
        public string GameId { get; set; } = string.Empty;
        public int TotalPlayers { get; set; }
        public int AlivePlayers { get; set; }
        public int DeadPlayers { get; set; }
        public int TotalTurns { get; set; }
        public int CurrentRound { get; set; }
        public GamePhase CurrentPhase { get; set; }
        public int TimeRemaining { get; set; }
        public DateTime GameStartTime { get; set; }
        public DateTime? GameEndTime { get; set; }
        public TimeSpan GameDuration => (GameEndTime ?? DateTime.UtcNow) - GameStartTime;
        public int TotalVotes { get; set; }
        public int TotalActions { get; set; }
        public int TotalMessages { get; set; }
        public int TotalEvents { get; set; }
        public Dictionary<Team, int> TeamCounts { get; set; } = new();
        public Dictionary<GamePhase, int> PhaseDurations { get; set; } = new();
        public List<string> DeadPlayersList { get; set; } = new();
        public string? Winner { get; set; }
    }

    /// <summary>
    /// Statistiques d'un joueur
    /// </summary>
    public class PlayerStatistics
    {
        public string PlayerId { get; set; } = string.Empty;
        public string PlayerName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public Team Team { get; set; }
        public bool IsAlive { get; set; }
        public bool IsConnected { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? DiedAt { get; set; }
        public TimeSpan? SurvivalTime => DiedAt.HasValue ? DiedAt.Value - JoinedAt : DateTime.UtcNow - JoinedAt;
        public int TotalVotes { get; set; }
        public int TotalActions { get; set; }
        public int TotalMessages { get; set; }
        public int VotesReceived { get; set; }
        public int ActionsTargeted { get; set; }
        public Dictionary<PlayerActionType, int> ActionCounts { get; set; } = new();
        public Dictionary<VoteType, int> VoteCounts { get; set; } = new();
        public Dictionary<MessageType, int> MessageCounts { get; set; } = new();
        public List<string> Notes { get; set; } = new();
        public int ChairNumber { get; set; }
        public bool HasSelectedChair { get; set; }
        public DateTime? ChairSelectedAt { get; set; }
    }

    /// <summary>
    /// Statistiques globales du système
    /// </summary>
    public class SystemStatistics
    {
        public int TotalGames { get; set; }
        public int ActiveGames { get; set; }
        public int FinishedGames { get; set; }
        public int TotalPlayers { get; set; }
        public int ActivePlayers { get; set; }
        public int TotalLobbies { get; set; }
        public int ActiveLobbies { get; set; }
        public Dictionary<Team, int> TeamWinCounts { get; set; } = new();
        public Dictionary<string, int> RoleUsageCounts { get; set; } = new();
        public Dictionary<GamePhase, TimeSpan> AveragePhaseDurations { get; set; } = new();
        public TimeSpan AverageGameDuration { get; set; }
        public int AveragePlayersPerGame { get; set; }
        public DateTime SystemStartTime { get; set; }
        public TimeSpan SystemUptime => DateTime.UtcNow - SystemStartTime;
    }
}
