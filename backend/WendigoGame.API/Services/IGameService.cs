using WendigoGame.API.Models;

namespace WendigoGame.API.Services
{
    /// <summary>
    /// Interface pour le service de gestion des parties
    /// </summary>
    public interface IGameService
    {
        // Gestion des parties
        Task<GameManager> CreateGameAsync(string lobbyId);
        Task<GameManager?> GetGameAsync(string gameId);
        Task<List<GameManager>> GetActiveGamesAsync();
        Task<bool> StartGameAsync(string gameId);
        Task<bool> EndGameAsync(string gameId);

        // Gestion des joueurs
        Task<Player?> AddPlayerToGameAsync(string gameId, string userId, string playerName);
        Task<bool> RemovePlayerFromGameAsync(string gameId, string playerId);
        Task<Player?> GetPlayerAsync(string gameId, string playerId);
        Task<List<Player>> GetGamePlayersAsync(string gameId);

        // Gestion des phases
        Task<bool> ChangeGamePhaseAsync(string gameId, GamePhase newPhase);
        Task<bool> UpdateGameTimerAsync(string gameId, int timeRemaining);
        Task<GamePhase> GetCurrentPhaseAsync(string gameId);

        // Gestion des actions
        Task<GameActionResult> ProcessPlayerActionAsync(string gameId, string playerId, GameActionContext context);
        Task<bool> SubmitVoteAsync(string gameId, string voterId, string targetPlayerId, VoteType voteType);
        Task<bool> SelectChairAsync(string gameId, string playerId, int chairNumber);

        // Gestion des votes
        Task<List<Vote>> GetGameVotesAsync(string gameId);
        Task<Dictionary<string, int>> GetVoteResultsAsync(string gameId);
        Task<bool> ProcessVoteResultsAsync(string gameId);

        // Gestion des événements
        Task<List<GameEvent>> GetGameEventsAsync(string gameId);
        Task<GameEvent> AddGameEventAsync(string gameId, GameEventType eventType, string description, string? playerId = null, string? targetPlayerId = null);

        // Gestion des messages
        Task<bool> SendGameMessageAsync(string gameId, string playerId, string content, MessageType messageType);
        Task<List<GameMessage>> GetGameMessagesAsync(string gameId, MessageType? messageType = null);

        // Gestion des notes
        Task<bool> AddPlayerNoteAsync(string gameId, string playerId, string targetPlayerId, string content);
        Task<List<PlayerNote>> GetPlayerNotesAsync(string gameId, string playerId);
        Task<bool> UpdatePlayerNoteAsync(string noteId, string content);

        // Vérifications de jeu
        Task<bool> IsGameFinishedAsync(string gameId);
        Task<string?> GetGameWinnerAsync(string gameId);
        Task<bool> CanPlayerPerformActionAsync(string gameId, string playerId, PlayerActionType actionType);

        // Gestion des rôles
        Task<List<IRole>> GetAvailableRolesAsync(int playerCount);
        Task<bool> AssignRolesToPlayersAsync(string gameId);
        Task<IRole?> GetPlayerRoleAsync(string gameId, string playerId);

        // Statistiques
        Task<GameStatistics> GetGameStatisticsAsync(string gameId);
        Task<List<PlayerStatistics>> GetPlayerStatisticsAsync(string gameId);
    }
}
