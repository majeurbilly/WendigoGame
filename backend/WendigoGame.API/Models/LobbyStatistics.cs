

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Statistiques d'un lobby
    /// </summary>
    public class LobbyStatistics
    {
        public string LobbyId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public int CurrentPlayers { get; set; }
        public int ReadyPlayers { get; set; }
        public LobbyStatus Status { get; set; }
        public string CreatorId { get; set; } = string.Empty;
        public string CreatorName { get; set; } = string.Empty;
        public bool IsPasswordProtected { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? GameStartedAt { get; set; }
        public string? GameId { get; set; }
        public TimeSpan LobbyDuration => (GameStartedAt ?? DateTime.UtcNow) - CreatedAt;
        public int TotalMessages { get; set; }
        public List<string> PlayerNames { get; set; } = new();
        public List<string> ReadyPlayerNames { get; set; } = new();
        public bool CanStart => CurrentPlayers >= MinPlayers && 
                               ReadyPlayers == CurrentPlayers && 
                               Status == LobbyStatus.Open;
        public double ReadyPercentage => CurrentPlayers > 0 ? (double)ReadyPlayers / CurrentPlayers * 100 : 0;
        public bool IsFull => CurrentPlayers >= MaxPlayers;
        public int AvailableSlots => MaxPlayers - CurrentPlayers;
    }
}
