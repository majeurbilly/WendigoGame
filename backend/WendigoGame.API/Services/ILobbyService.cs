using WendigoGame.API.Models;

namespace WendigoGame.API.Services
{
    /// <summary>
    /// Interface pour le service de gestion des lobbys
    /// </summary>
    public interface ILobbyService
    {
        // Gestion des lobbys
        Task<Lobby> CreateLobbyAsync(string creatorId, string name, string? description = null, int minPlayers = 8, int maxPlayers = 29, string? password = null);
        Task<Lobby?> GetLobbyAsync(string lobbyId);
        Task<List<Lobby>> GetActiveLobbiesAsync();
        Task<List<Lobby>> GetLobbiesByUserAsync(string userId);
        Task<bool> DeleteLobbyAsync(string lobbyId, string userId);
        Task<bool> UpdateLobbyAsync(string lobbyId, string userId, string? name = null, string? description = null, int? minPlayers = null, int? maxPlayers = null, string? password = null);

        // Gestion des joueurs dans les lobbys
        Task<bool> JoinLobbyAsync(string lobbyId, string userId, string playerName, string? password = null);
        Task<bool> LeaveLobbyAsync(string lobbyId, string userId);
        Task<bool> UpdatePlayerReadyAsync(string lobbyId, string userId, bool isReady);
        Task<List<LobbyPlayer>> GetLobbyPlayersAsync(string lobbyId);
        Task<LobbyPlayer?> GetLobbyPlayerAsync(string lobbyId, string userId);

        // Gestion des messages de lobby
        Task<bool> SendLobbyMessageAsync(string lobbyId, string userId, string content);
        Task<List<LobbyMessage>> GetLobbyMessagesAsync(string lobbyId, int count = 50);
        Task<bool> ClearLobbyMessagesAsync(string lobbyId, string userId);

        // Gestion du démarrage de partie
        Task<bool> CanStartGameAsync(string lobbyId);
        Task<GameManager?> StartGameFromLobbyAsync(string lobbyId, string userId);
        Task<bool> IsLobbyReadyToStartAsync(string lobbyId);

        // Vérifications
        Task<bool> IsUserInLobbyAsync(string lobbyId, string userId);
        Task<bool> IsLobbyCreatorAsync(string lobbyId, string userId);
        Task<bool> IsLobbyFullAsync(string lobbyId);
        Task<bool> IsLobbyPasswordProtectedAsync(string lobbyId);
        Task<bool> ValidateLobbyPasswordAsync(string lobbyId, string password);

        // Statistiques
        Task<LobbyStatistics> GetLobbyStatisticsAsync(string lobbyId);
        Task<List<LobbyStatistics>> GetAllLobbyStatisticsAsync();
    }
}
