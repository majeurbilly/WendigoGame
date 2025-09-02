using Microsoft.EntityFrameworkCore;
using WendigoGame.API.Data;
using WendigoGame.API.Models;
using WendigoGame.API.Models.Roles;
using GameEntity = WendigoGame.API.Models.Game;

namespace WendigoGame.API.Services
{
    /// <summary>
    /// Service de gestion des parties Wendigo Game
    /// </summary>
    public class GameService : IGameService
    {
        private readonly WendigoGameContext _context;
        private readonly ILogger<GameService> _logger;
        private readonly Dictionary<string, GameManager> _activeGames = new();

        public GameService(WendigoGameContext context, ILogger<GameService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Gestion des parties

        public async Task<GameManager> CreateGameAsync(string lobbyId)
        {
            Lobby lobby = await _context.Lobbies
                .Include(l => l.Players)
                .FirstOrDefaultAsync(l => l.Id == lobbyId);

            if (lobby == null)
                throw new ArgumentException("Lobby introuvable");

            if (!lobby.CanStart)
                throw new InvalidOperationException("Le lobby ne peut pas démarrer");

            Game game = new Game
            {
                Id = Guid.NewGuid().ToString(),
                Name = $"Partie de {lobby.Name}",
                LobbyId = lobby.Id,
                Status = GameStatus.Waiting,
                CurrentPhase = GamePhase.Day,
                PhaseDuration = TimeSpan.FromMinutes(10),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Créer les joueurs à partir du lobby
            List<IRole> roles = GenerateRolesForPlayerCount(lobby.Players.Count);
            List<IRole> shuffledRoles = roles.OrderBy(x => Guid.NewGuid()).ToList();

            for (int i = 0; i < lobby.Players.Count; i++)
            {
                LobbyPlayer lobbyPlayer = lobby.Players[i];
                Player player = new Player
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = lobbyPlayer.Name,
                    UserId = lobbyPlayer.UserId,
                    Role = shuffledRoles[i],
                    IsAlive = true,
                    IsReady = true,
                    GameId = game.Id,
                    Color = GeneratePlayerColor(i)
                };

                game.Players.Add(player);
            }

            // Sauvegarder en base
            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            // Marquer le lobby comme démarré
            lobby.StartGame(game.Id);
            _context.Lobbies.Update(lobby);
            await _context.SaveChangesAsync();

            // Ajouter à la mémoire (convertir d'abord en GameManager)
            GameManager gameManagerForMemory = new GameManager
            {
                GameId = game.Id,
                Status = game.Status,
                CurrentPhase = game.CurrentPhase,
                CreatedAt = game.CreatedAt,
                UpdatedAt = game.UpdatedAt,
                TotalTime = (int)game.PhaseDuration.TotalSeconds,
                TimeRemaining = (int)game.PhaseDuration.TotalSeconds
            };

            // Copier les joueurs
            foreach (Player player in game.Players)
            {
                gameManagerForMemory.Players.Add(player);
            }

            _activeGames[game.Id] = gameManagerForMemory;

            _logger.LogInformation("Partie créée : {GameId} avec {PlayerCount} joueurs", game.Id, game.Players.Count);

            // Convertir Game en GameManager pour le retour
            GameManager gameManager = new GameManager
            {
                GameId = game.Id,
                Status = game.Status,
                CurrentPhase = game.CurrentPhase,
                CreatedAt = game.CreatedAt,
                UpdatedAt = game.UpdatedAt,
                TotalTime = (int)game.PhaseDuration.TotalSeconds,
                TimeRemaining = (int)game.PhaseDuration.TotalSeconds
            };

            // Copier les joueurs
            foreach (Player player in game.Players)
            {
                gameManager.Players.Add(player);
            }

            return gameManager;
        }

        public async Task<GameManager?> GetGameAsync(string gameId)
        {
            // Vérifier d'abord en mémoire
            if (_activeGames.TryGetValue(gameId, out GameManager game))
                return game;

            // Charger depuis la base
            GameEntity dbGame = await _context.Games
                .Include(g => g.Players)
                .Include(g => g.GameEvents)
                .Include(g => g.GameMessages)
                .FirstOrDefaultAsync(g => g.Id == gameId);

            if (dbGame != null)
            {
                // Convertir l'entité Game en GameManager
                GameManager gameManager = new GameManager
                {
                    GameId = dbGame.Id,
                    Status = dbGame.Status,
                    CurrentPhase = dbGame.CurrentPhase,
                    CreatedAt = dbGame.CreatedAt,
                    UpdatedAt = dbGame.UpdatedAt,
                    TotalTime = (int)dbGame.PhaseDuration.TotalSeconds,
                    TimeRemaining = (int)dbGame.PhaseDuration.TotalSeconds
                };
                
                _activeGames[gameId] = gameManager;
                return gameManager;
            }

            return null;
        }

        public async Task<List<GameManager>> GetActiveGamesAsync()
        {
            List<Game> dbGames = await _context.Games
                .Where(g => g.Status == GameStatus.Playing || g.Status == GameStatus.Waiting)
                .Include(g => g.Players)
                .ToListAsync();

            List<GameManager> gameManagers = new List<GameManager>();
            foreach (Game dbGame in dbGames)
            {
                GameManager gameManager = new GameManager
                {
                    GameId = dbGame.Id,
                    Status = dbGame.Status,
                    CurrentPhase = dbGame.CurrentPhase,
                    CreatedAt = dbGame.CreatedAt,
                    UpdatedAt = dbGame.UpdatedAt,
                    TotalTime = (int)dbGame.PhaseDuration.TotalSeconds,
                    TimeRemaining = (int)dbGame.PhaseDuration.TotalSeconds
                };

                // Copier les joueurs
                foreach (Player player in dbGame.Players)
                {
                    gameManager.Players.Add(player);
                }

                gameManagers.Add(gameManager);
            }

            return gameManagers;
        }

        public async Task<bool> StartGameAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null || game.Status != GameStatus.Waiting)
                return false;

            game.Status = GameStatus.Playing;
            game.CurrentPhase = GamePhase.Day;
            game.TimeRemaining = 600; // 10 minutes
            game.TotalTime = 600;

            await _context.SaveChangesAsync();

            // Ajouter un événement
            await AddGameEventAsync(gameId, GameEventType.PhaseChanged, "La partie a commencé !");

            _logger.LogInformation("Partie démarrée : {GameId}", gameId);
            return true;
        }

        public async Task<bool> EndGameAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            game.Status = GameStatus.Finished;
            await _context.SaveChangesAsync();

            // Retirer de la mémoire
            _activeGames.Remove(gameId);

            _logger.LogInformation("Partie terminée : {GameId}", gameId);
            return true;
        }

        #endregion

        #region Gestion des joueurs

        public async Task<Player?> AddPlayerToGameAsync(string gameId, string userId, string playerName)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null || game.Status != GameStatus.Waiting)
                return null;

            Player player = new Player
            {
                Id = Guid.NewGuid().ToString(),
                Name = playerName,
                UserId = userId,
                GameId = gameId,
                IsAlive = true,
                IsReady = false
            };

            game.Players.Add(player);
            await _context.SaveChangesAsync();

            return player;
        }

        public async Task<bool> RemovePlayerFromGameAsync(string gameId, string playerId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
                return false;

            game.Players.Remove(player);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Player?> GetPlayerAsync(string gameId, string playerId)
        {
            GameManager game = await GetGameAsync(gameId);
            return game?.Players.FirstOrDefault(p => p.Id == playerId);
        }

        public async Task<List<Player>> GetGamePlayersAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            return game?.Players ?? new List<Player>();
        }

        #endregion

        #region Gestion des phases

        public async Task<bool> ChangeGamePhaseAsync(string gameId, GamePhase newPhase)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            GamePhase oldPhase = game.CurrentPhase;
            game.CurrentPhase = newPhase;
            game.UpdatedAt = DateTime.UtcNow;

            // Définir le temps selon la phase
            game.TotalTime = newPhase switch
            {
                GamePhase.Day => 600,      // 10 minutes
                GamePhase.Evening => 300,  // 5 minutes
                GamePhase.Night => 300,    // 5 minutes
                GamePhase.WakeUp => 60,    // 1 minute
                _ => 300
            };

            game.TimeRemaining = game.TotalTime;

            await _context.SaveChangesAsync();

            // Ajouter un événement
            await AddGameEventAsync(gameId, GameEventType.PhaseChanged, 
                $"Phase changée de {oldPhase} vers {newPhase}");

            _logger.LogInformation("Phase changée pour {GameId} : {OldPhase} -> {NewPhase}", 
                gameId, oldPhase, newPhase);

            return true;
        }

        public async Task<bool> UpdateGameTimerAsync(string gameId, int timeRemaining)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            game.TimeRemaining = timeRemaining;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<GamePhase> GetCurrentPhaseAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            return game?.CurrentPhase ?? GamePhase.Day;
        }

        #endregion

        #region Gestion des actions

        public async Task<GameActionResult> ProcessPlayerActionAsync(string gameId, string playerId, GameActionContext context)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return GameActionResult.FailureResult("Partie introuvable");

            Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
                return GameActionResult.FailureResult("Joueur introuvable");

            if (!player.CanPerformAction(context))
                return GameActionResult.FailureResult("Le joueur ne peut pas effectuer cette action");

            GameActionResult result = await player.PerformActionAsync(context);

            if (result.Success)
            {
                // Ajouter l'action à l'historique
                player.AddAction(context.TargetPlayerId != null ? PlayerActionType.UsePower : PlayerActionType.UsePower, 
                    context.TargetPlayerId, context.AdditionalData);

                // Ajouter les événements déclenchés
                foreach (GameEvent evt in result.TriggeredEvents)
                {
                    _context.GameEvents.Add(evt);
                }

                await _context.SaveChangesAsync();
            }

            return result;
        }

        public async Task<bool> SubmitVoteAsync(string gameId, string voterId, string targetPlayerId, VoteType voteType)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Player voter = game.Players.FirstOrDefault(p => p.Id == voterId);
            if (voter == null || !voter.CanVote(game.CurrentPhase))
                return false;

            Vote vote = new Vote
            {
                Id = Guid.NewGuid().ToString(),
                VoterId = voterId,
                TargetPlayerId = targetPlayerId,
                VoteType = voteType,
                Timestamp = DateTime.UtcNow
            };

            game.Votes.Add(vote);
            voter.AddVote(targetPlayerId, voteType);

            await _context.SaveChangesAsync();

            // Ajouter un événement
            await AddGameEventAsync(gameId, GameEventType.VoteSubmitted, 
                $"{voter.Name} a voté pour {targetPlayerId}");

            return true;
        }

        public async Task<bool> SelectChairAsync(string gameId, string playerId, int chairNumber)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null || !player.CanSelectChair(game.CurrentPhase, game.TimeRemaining))
                return false;

            // Vérifier que la chaise n'est pas déjà prise
            if (game.Players.Any(p => p.SelectedChair == chairNumber))
                return false;

            player.SelectedChair = chairNumber;
            player.AddAction(PlayerActionType.SelectChair, null, 
                new Dictionary<string, object> { ["chairNumber"] = chairNumber });

            await _context.SaveChangesAsync();

            // Ajouter un événement
            await AddGameEventAsync(gameId, GameEventType.ChairSelected, 
                $"{player.Name} a sélectionné la chaise {chairNumber}");

            return true;
        }

        #endregion

        #region Gestion des votes

        public async Task<List<Vote>> GetGameVotesAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            return game?.Votes ?? new List<Vote>();
        }

        public async Task<Dictionary<string, int>> GetVoteResultsAsync(string gameId)
        {
            List<Vote> votes = await GetGameVotesAsync(gameId);
            return votes.GroupBy(v => v.TargetPlayerId)
                       .ToDictionary(g => g.Key, g => g.Count());
        }

        public async Task<bool> ProcessVoteResultsAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Dictionary<string, int> voteResults = await GetVoteResultsAsync(gameId);
            if (!voteResults.Any())
                return false;

            // Trouver le joueur avec le plus de votes
            int maxVotes = voteResults.Values.Max();
            List<KeyValuePair<string, int>> accusedPlayers = voteResults.Where(kvp => kvp.Value == maxVotes).ToList();

            if (accusedPlayers.Count == 1)
            {
                string accusedPlayerId = accusedPlayers.First().Key;
                Player accusedPlayer = game.Players.FirstOrDefault(p => p.Id == accusedPlayerId);
                
                if (accusedPlayer != null)
                {
                    // Le joueur accusé va plaider son innocence
                    await AddGameEventAsync(gameId, GameEventType.PlayerAction, 
                        $"{accusedPlayer.Name} est accusé et va plaider son innocence");
                }
            }
            else
            {
                // Égalité - pas d'accusation
                await AddGameEventAsync(gameId, GameEventType.PlayerAction, 
                    "Égalité des votes - personne n'est accusé");
            }

            return true;
        }

        #endregion

        #region Gestion des événements

        public async Task<List<GameEvent>> GetGameEventsAsync(string gameId)
        {
            return await _context.GameEvents
                .Where(e => e.GameId == gameId)
                .OrderBy(e => e.Timestamp)
                .ToListAsync();
        }

        public async Task<GameEvent> AddGameEventAsync(string gameId, GameEventType eventType, string description, string? playerId = null, string? targetPlayerId = null)
        {
            GameEvent gameEvent = new GameEvent
            {
                Id = Guid.NewGuid().ToString(),
                GameId = gameId,
                EventType = eventType,
                PlayerId = playerId,
                TargetPlayerId = targetPlayerId,
                Description = description,
                Timestamp = DateTime.UtcNow
            };

            _context.GameEvents.Add(gameEvent);
            await _context.SaveChangesAsync();

            return gameEvent;
        }

        #endregion

        #region Gestion des messages

        public async Task<bool> SendGameMessageAsync(string gameId, string playerId, string content, MessageType messageType)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
                return false;

            GameMessage message = new GameMessage
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = playerId,
                Content = content,
                MessageType = messageType,
                Timestamp = DateTime.UtcNow
            };

            game.Messages.Add(message);
            player.AddMessage(content, messageType);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<GameMessage>> GetGameMessagesAsync(string gameId, MessageType? messageType = null)
        {
            IQueryable<GameMessage> query = _context.GameMessages.Where(m => m.PlayerId == gameId);
            
            if (messageType.HasValue)
                query = query.Where(m => m.MessageType == messageType.Value);

            return await query.OrderBy(m => m.Timestamp).ToListAsync();
        }

        #endregion

        #region Gestion des notes

        public async Task<bool> AddPlayerNoteAsync(string gameId, string playerId, string targetPlayerId, string content)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
                return false;

            PlayerNote note = new PlayerNote
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = playerId,
                TargetPlayerId = targetPlayerId,
                Content = content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PlayerNotes.Add(note);
            player.Notes.Add(note);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<PlayerNote>> GetPlayerNotesAsync(string gameId, string playerId)
        {
            return await _context.PlayerNotes
                .Where(n => n.PlayerId == playerId)
                .OrderBy(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdatePlayerNoteAsync(string noteId, string content)
        {
            PlayerNote note = await _context.PlayerNotes.FindAsync(noteId);
            if (note == null)
                return false;

            note.Content = content;
            note.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Vérifications de jeu

        public async Task<bool> IsGameFinishedAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            return game?.IsFinish() ?? false;
        }

        public async Task<string?> GetGameWinnerAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null || !game.IsFinish())
                return null;

            List<Player> alivePlayers = game.GetAlivePlayers();
            List<Player> aliveWolves = alivePlayers.Where(p => p.Team == Team.Wolves).ToList();
            List<Player> aliveVillagers = alivePlayers.Where(p => p.Team == Team.Village).ToList();

            if (aliveWolves.Count == 0)
                return "Villageois";
            else if (aliveVillagers.Count == 0)
                return "Loups";
            else
                return "Égalité";
        }

        public async Task<bool> CanPlayerPerformActionAsync(string gameId, string playerId, PlayerActionType actionType)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null || !player.IsAlive)
                return false;

            return actionType switch
            {
                PlayerActionType.SelectChair => player.CanSelectChair(game.CurrentPhase, game.TimeRemaining),
                PlayerActionType.SubmitVote => player.CanVote(game.CurrentPhase),
                PlayerActionType.UsePower => player.CanUsePower(game.CurrentPhase),
                _ => false
            };
        }

        #endregion

        #region Gestion des rôles

        public async Task<List<IRole>> GetAvailableRolesAsync(int playerCount)
        {
            // Pour l'instant, on utilise les rôles de base
            // Dans une version complète, on implémenterait les 29 rôles
            List<IRole> roles = new List<IRole>();

            int wolfCount = Math.Max(1, playerCount / 4);
            int villagerCount = playerCount - wolfCount;

            for (int i = 0; i < wolfCount; i++)
            {
                roles.Add(new Loup());
            }

            for (int i = 0; i < villagerCount; i++)
            {
                roles.Add(new Villageois());
            }

            return roles;
        }

        public async Task<bool> AssignRolesToPlayersAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return false;

            List<IRole> roles = await GetAvailableRolesAsync(game.Players.Count);
            List<IRole> shuffledRoles = roles.OrderBy(x => Guid.NewGuid()).ToList();

            for (int i = 0; i < game.Players.Count; i++)
            {
                game.Players[i].Role = shuffledRoles[i];
            }

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IRole?> GetPlayerRoleAsync(string gameId, string playerId)
        {
            Player player = await GetPlayerAsync(gameId, playerId);
            return player?.Role;
        }

        #endregion

        #region Statistiques

        public async Task<GameStatistics> GetGameStatisticsAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return new GameStatistics();

            List<Player> alivePlayers = game.GetAlivePlayers();
            List<Player> deadPlayers = game.Players.Where(p => !p.IsAlive).ToList();

            return new GameStatistics
            {
                GameId = gameId,
                TotalPlayers = game.Players.Count,
                AlivePlayers = alivePlayers.Count,
                DeadPlayers = deadPlayers.Count,
                TotalTurns = game.NbTurn,
                CurrentRound = game.CurrentRound,
                CurrentPhase = game.CurrentPhase,
                TimeRemaining = game.TimeRemaining,
                GameStartTime = game.CreatedAt,
                GameEndTime = game.Status == GameStatus.Finished ? game.UpdatedAt : null,
                TotalVotes = game.Votes.Count,
                TotalActions = game.Players.Sum(p => p.Actions.Count),
                TotalMessages = game.Messages.Count,
                TotalEvents = game.Events.Count,
                TeamCounts = new Dictionary<Team, int>
                {
                    [Team.Wolves] = alivePlayers.Count(p => p.Team == Team.Wolves),
                    [Team.Village] = alivePlayers.Count(p => p.Team == Team.Village)
                },
                DeadPlayersList = deadPlayers.Select(p => p.Name).ToList(),
                Winner = game.Status == GameStatus.Finished ? await GetGameWinnerAsync(gameId) : null
            };
        }

        public async Task<List<PlayerStatistics>> GetPlayerStatisticsAsync(string gameId)
        {
            GameManager game = await GetGameAsync(gameId);
            if (game == null)
                return new List<PlayerStatistics>();

            List<PlayerStatistics> statistics = new List<PlayerStatistics>();

            foreach (Player player in game.Players)
            {
                PlayerStatistics playerStats = new PlayerStatistics
                {
                    PlayerId = player.Id,
                    PlayerName = player.Name,
                    RoleName = player.Role.Name,
                    Team = player.Team,
                    IsAlive = player.IsAlive,
                    IsConnected = player.IsConnected,
                    JoinedAt = player.CreatedAt,
                    DiedAt = player.IsAlive ? null : player.UpdatedAt,
                    TotalVotes = player.Votes.Count,
                    TotalActions = player.Actions.Count,
                    TotalMessages = player.Messages.Count,
                    VotesReceived = game.Votes.Count(v => v.TargetPlayerId == player.Id),
                    ActionsTargeted = game.Players.Sum(p => p.Actions.Count(a => a.TargetPlayerId == player.Id)),
                    ActionCounts = player.Actions.GroupBy(a => a.ActionType)
                                               .ToDictionary(g => g.Key, g => g.Count()),
                    VoteCounts = player.Votes.GroupBy(v => v.VoteType)
                                            .ToDictionary(g => g.Key, g => g.Count()),
                    MessageCounts = player.Messages.GroupBy(m => m.MessageType)
                                                  .ToDictionary(g => g.Key, g => g.Count()),
                    Notes = player.Notes.Select(n => n.Content).ToList(),
                    ChairNumber = player.SelectedChair ?? 0,
                    HasSelectedChair = player.SelectedChair.HasValue,
                    ChairSelectedAt = player.SelectedChair.HasValue ? player.UpdatedAt : null
                };

                statistics.Add(playerStats);
            }

            return statistics;
        }

        #endregion

        #region Méthodes privées

        private List<IRole> GenerateRolesForPlayerCount(int playerCount)
        {
            List<IRole> roles = new List<IRole>();
            
            int wolfCount = Math.Max(1, playerCount / 4);
            int villagerCount = playerCount - wolfCount;

            for (int i = 0; i < wolfCount; i++)
            {
                roles.Add(new Loup());
            }

            for (int i = 0; i < villagerCount; i++)
            {
                roles.Add(new Villageois());
            }

            return roles;
        }

        private string GeneratePlayerColor(int index)
        {
            string[] colors = new[]
            {
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
                "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
            };
            
            return colors[index % colors.Length];
        }

        #endregion
    }
}
