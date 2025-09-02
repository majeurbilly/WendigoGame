using Microsoft.EntityFrameworkCore;
using WendigoGame.API.Data;
using WendigoGame.API.Models;


namespace WendigoGame.API.Services
{
    /// <summary>
    /// Service de gestion des lobbys Wendigo Game
    /// </summary>
    public class LobbyService : ILobbyService
    {
        private readonly WendigoGameContext _context;
        private readonly IGameService _gameService;
        private readonly ILogger<LobbyService> _logger;

        public LobbyService(WendigoGameContext context, IGameService gameService, ILogger<LobbyService> logger)
        {
            _context = context;
            _gameService = gameService;
            _logger = logger;
        }

        #region Gestion des lobbys

        public async Task<Lobby> CreateLobbyAsync(string creatorId, string name, string? description = null, int minPlayers = 8, int maxPlayers = 29, string? password = null)
        {
            if (minPlayers < 8 || maxPlayers > 29 || minPlayers > maxPlayers)
                throw new ArgumentException("Paramètres de lobby invalides");

            Lobby lobby = new Lobby
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
                Description = description ?? string.Empty,
                MinPlayers = minPlayers,
                MaxPlayers = maxPlayers,
                CreatorId = creatorId,
                Password = password,
                Status = LobbyStatus.Open,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Lobbies.Add(lobby);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Lobby créé : {LobbyId} par {CreatorId}", lobby.Id, creatorId);

            return lobby;
        }

        public async Task<Lobby?> GetLobbyAsync(string lobbyId)
        {
            return await _context.Lobbies
                .Include(l => l.Players)
                .Include(l => l.Messages)
                .FirstOrDefaultAsync(l => l.Id == lobbyId);
        }

        public async Task<List<Lobby>> GetActiveLobbiesAsync()
        {
            return await _context.Lobbies
                .Where(l => l.Status == LobbyStatus.Open)
                .Include(l => l.Players)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Lobby>> GetLobbiesByUserAsync(string userId)
        {
            return await _context.Lobbies
                .Where(l => l.CreatorId == userId || l.Players.Any(p => p.UserId == userId))
                .Include(l => l.Players)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteLobbyAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null || lobby.CreatorId != userId)
                return false;

            _context.Lobbies.Remove(lobby);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Lobby supprimé : {LobbyId} par {UserId}", lobbyId, userId);

            return true;
        }

        public async Task<bool> UpdateLobbyAsync(string lobbyId, string userId, string? name = null, string? description = null, int? minPlayers = null, int? maxPlayers = null, string? password = null)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null || lobby.CreatorId != userId || lobby.Status != LobbyStatus.Open)
                return false;

            if (name != null) lobby.Name = name;
            if (description != null) lobby.Description = description;
            if (minPlayers.HasValue) lobby.MinPlayers = minPlayers.Value;
            if (maxPlayers.HasValue) lobby.MaxPlayers = maxPlayers.Value;
            if (password != null) lobby.Password = password;

            lobby.UpdatedAt = DateTime.UtcNow;

            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Gestion des joueurs dans les lobbys

        public async Task<bool> JoinLobbyAsync(string lobbyId, string userId, string playerName, string? password = null)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null || lobby.Status != LobbyStatus.Open)
                return false;

            if (lobby.IsFull)
                return false;

            if (lobby.ContainsUser(userId))
                return false;

            if (lobby.IsPasswordProtected() && !lobby.ValidateLobbyPassword(password))
                return false;

            LobbyPlayer player = new LobbyPlayer
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                Name = playerName,
                LobbyId = lobbyId,
                IsReady = false,
                JoinedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            lobby.Players.Add(player);
            lobby.UpdatedAt = DateTime.UtcNow;

            _context.LobbyPlayers.Add(player);
            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Joueur {PlayerName} a rejoint le lobby {LobbyId}", playerName, lobbyId);

            return true;
        }

        public async Task<bool> LeaveLobbyAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null)
                return false;

            LobbyPlayer player = lobby.Players.FirstOrDefault(p => p.UserId == userId);
            if (player == null)
                return false;

            lobby.Players.Remove(player);
            lobby.UpdatedAt = DateTime.UtcNow;

            _context.LobbyPlayers.Remove(player);
            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Joueur {PlayerName} a quitté le lobby {LobbyId}", player.Name, lobbyId);

            return true;
        }

        public async Task<bool> UpdatePlayerReadyAsync(string lobbyId, string userId, bool isReady)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null || lobby.Status != LobbyStatus.Open)
                return false;

            LobbyPlayer player = lobby.Players.FirstOrDefault(p => p.UserId == userId);
            if (player == null)
                return false;

            player.IsReady = isReady;
            player.UpdatedAt = DateTime.UtcNow;
            lobby.UpdatedAt = DateTime.UtcNow;

            _context.LobbyPlayers.Update(player);
            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<LobbyPlayer>> GetLobbyPlayersAsync(string lobbyId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.Players ?? new List<LobbyPlayer>();
        }

        public async Task<LobbyPlayer?> GetLobbyPlayerAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.Players.FirstOrDefault(p => p.UserId == userId);
        }

        #endregion

        #region Gestion des messages de lobby

        public async Task<bool> SendLobbyMessageAsync(string lobbyId, string userId, string content)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null)
                return false;

            LobbyPlayer player = lobby.Players.FirstOrDefault(p => p.UserId == userId);
            if (player == null)
                return false;

            LobbyMessage message = new LobbyMessage
            {
                Id = Guid.NewGuid().ToString(),
                LobbyId = lobbyId,
                UserId = userId,
                PlayerName = player.Name,
                Content = content,
                Timestamp = DateTime.UtcNow
            };

            lobby.Messages.Add(message);
            lobby.UpdatedAt = DateTime.UtcNow;

            _context.LobbyMessages.Add(message);
            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<LobbyMessage>> GetLobbyMessagesAsync(string lobbyId, int count = 50)
        {
            return await _context.LobbyMessages
                .Where(m => m.LobbyId == lobbyId)
                .OrderByDescending(m => m.Timestamp)
                .Take(count)
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }

        public async Task<bool> ClearLobbyMessagesAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null || lobby.CreatorId != userId)
                return false;

            List<LobbyMessage> messages = await _context.LobbyMessages
                .Where(m => m.LobbyId == lobbyId)
                .ToListAsync();

            _context.LobbyMessages.RemoveRange(messages);
            lobby.Messages.Clear();
            lobby.UpdatedAt = DateTime.UtcNow;

            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Gestion du démarrage de partie

        public async Task<bool> CanStartGameAsync(string lobbyId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.CanStart ?? false;
        }

        public async Task<GameManager?> StartGameFromLobbyAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null || lobby.CreatorId != userId || !lobby.CanStart)
                return null;

            try
            {
                GameManager game = await _gameService.CreateGameAsync(lobbyId);
                if (game != null)
                {
                    await _gameService.StartGameAsync(game.GameId);
                    _logger.LogInformation("Partie démarrée depuis le lobby {LobbyId} : {GameId}", lobbyId, game.GameId);
                }

                return game;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du démarrage de la partie depuis le lobby {LobbyId}", lobbyId);
                return null;
            }
        }

        public async Task<bool> IsLobbyReadyToStartAsync(string lobbyId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.CanStart ?? false;
        }

        #endregion

        #region Vérifications

        public async Task<bool> IsUserInLobbyAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.ContainsUser(userId) ?? false;
        }

        public async Task<bool> IsLobbyCreatorAsync(string lobbyId, string userId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.IsCreator(userId) ?? false;
        }

        public async Task<bool> IsLobbyFullAsync(string lobbyId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.IsFull ?? false;
        }

        public async Task<bool> IsLobbyPasswordProtectedAsync(string lobbyId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.IsPasswordProtected() ?? false;
        }

        public async Task<bool> ValidateLobbyPasswordAsync(string lobbyId, string password)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            return lobby?.ValidateLobbyPassword(password) ?? false;
        }

        #endregion

        #region Statistiques

        public async Task<LobbyStatistics> GetLobbyStatisticsAsync(string lobbyId)
        {
            Lobby lobby = await GetLobbyAsync(lobbyId);
            if (lobby == null)
                return new LobbyStatistics();

            LobbyPlayer creator = lobby.Players.FirstOrDefault(p => p.UserId == lobby.CreatorId);

            return new LobbyStatistics
            {
                LobbyId = lobby.Id,
                Name = lobby.Name,
                Description = lobby.Description,
                MinPlayers = lobby.MinPlayers,
                MaxPlayers = lobby.MaxPlayers,
                CurrentPlayers = lobby.Players.Count,
                ReadyPlayers = lobby.ReadyPlayersCount,
                Status = lobby.Status,
                CreatorId = lobby.CreatorId,
                CreatorName = creator?.Name ?? "Inconnu",
                IsPasswordProtected = !string.IsNullOrEmpty(lobby.Password),
                CreatedAt = lobby.CreatedAt,
                GameStartedAt = lobby.GameStartedAt,
                GameId = lobby.GameId,
                TotalMessages = lobby.Messages.Count,
                PlayerNames = lobby.Players.Select(p => p.Name).ToList(),
                ReadyPlayerNames = lobby.Players.Where(p => p.IsReady).Select(p => p.Name).ToList()
            };
        }

        public async Task<List<LobbyStatistics>> GetAllLobbyStatisticsAsync()
        {
            List<Lobby> lobbies = await GetActiveLobbiesAsync();
            List<LobbyStatistics> statistics = new List<LobbyStatistics>();

            foreach (Lobby lobby in lobbies)
            {
                LobbyStatistics stats = await GetLobbyStatisticsAsync(lobby.Id);
                statistics.Add(stats);
            }

            return statistics;
        }

        #endregion
    }
}
