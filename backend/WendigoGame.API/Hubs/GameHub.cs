using Microsoft.AspNetCore.SignalR;
using WendigoGame.API.Models;

using WendigoGame.API.Services;

namespace WendigoGame.API.Hubs
{
    /// <summary>
    /// Hub SignalR pour la communication temps réel du jeu Wendigo
    /// </summary>
    public class GameHub : Hub
    {
        private readonly IGameService _gameService;
        private readonly ILobbyService _lobbyService;
        private readonly ILogger<GameHub> _logger;

        public GameHub(IGameService gameService, ILobbyService lobbyService, ILogger<GameHub> logger)
        {
            _gameService = gameService;
            _lobbyService = lobbyService;
            _logger = logger;
        }

        #region Connexion et déconnexion

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connecté : {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client déconnecté : {ConnectionId}", Context.ConnectionId);
            
            // Mettre à jour le statut de connexion des joueurs
            await UpdatePlayerConnectionStatus(Context.ConnectionId, false);
            
            await base.OnDisconnectedAsync(exception);
        }

        #endregion

        #region Gestion des lobbys

        /// <summary>
        /// Rejoint un lobby
        /// </summary>
        public async Task JoinLobby(string lobbyId, string userId)
        {
            try
            {
                Lobby lobby = await _lobbyService.GetLobbyAsync(lobbyId);
                if (lobby == null)
                {
                    await Clients.Caller.SendAsync("LobbyError", "Lobby introuvable");
                    return;
                }

                LobbyPlayer player = lobby.Players.FirstOrDefault(p => p.UserId == userId);
                if (player == null)
                {
                    await Clients.Caller.SendAsync("LobbyError", "Vous n'êtes pas dans ce lobby");
                    return;
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");
                
                // Mettre à jour le statut de connexion
                await UpdateLobbyPlayerConnectionStatus(lobbyId, userId, true, Context.ConnectionId);

                await Clients.Group($"lobby_{lobbyId}").SendAsync("PlayerJoined", new
                {
                    PlayerId = player.Id,
                    PlayerName = player.Name,
                    IsReady = player.IsReady,
                    ConnectionId = Context.ConnectionId
                });

                _logger.LogInformation("Joueur {PlayerName} a rejoint le lobby {LobbyId}", player.Name, lobbyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la jonction au lobby {LobbyId}", lobbyId);
                await Clients.Caller.SendAsync("LobbyError", "Erreur lors de la jonction au lobby");
            }
        }

        /// <summary>
        /// Quitte un lobby
        /// </summary>
        public async Task LeaveLobby(string lobbyId, string userId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");
                
                // Mettre à jour le statut de connexion
                await UpdateLobbyPlayerConnectionStatus(lobbyId, userId, false, null);

                await Clients.Group($"lobby_{lobbyId}").SendAsync("PlayerLeft", new
                {
                    UserId = userId,
                    ConnectionId = Context.ConnectionId
                });

                _logger.LogInformation("Joueur {UserId} a quitté le lobby {LobbyId}", userId, lobbyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sortie du lobby {LobbyId}", lobbyId);
            }
        }

        /// <summary>
        /// Envoie un message dans un lobby
        /// </summary>
        public async Task SendLobbyMessage(string lobbyId, string userId, string content)
        {
            try
            {
                bool success = await _lobbyService.SendLobbyMessageAsync(lobbyId, userId, content);
                if (!success)
                {
                    await Clients.Caller.SendAsync("LobbyError", "Impossible d'envoyer le message");
                    return;
                }

                LobbyPlayer player = await _lobbyService.GetLobbyPlayerAsync(lobbyId, userId);
                if (player != null)
                {
                    await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyMessage", new
                    {
                        Id = Guid.NewGuid().ToString(),
                        PlayerName = player.Name,
                        Content = content,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi du message dans le lobby {LobbyId}", lobbyId);
                await Clients.Caller.SendAsync("LobbyError", "Erreur lors de l'envoi du message");
            }
        }

        /// <summary>
        /// Met à jour le statut de prêt d'un joueur
        /// </summary>
        public async Task UpdatePlayerReady(string lobbyId, string userId, bool isReady)
        {
            try
            {
                bool success = await _lobbyService.UpdatePlayerReadyAsync(lobbyId, userId, isReady);
                if (!success)
                {
                    await Clients.Caller.SendAsync("LobbyError", "Impossible de mettre à jour le statut de prêt");
                    return;
                }

                LobbyPlayer player = await _lobbyService.GetLobbyPlayerAsync(lobbyId, userId);
                if (player != null)
                {
                    await Clients.Group($"lobby_{lobbyId}").SendAsync("PlayerReadyUpdated", new
                    {
                        UserId = userId,
                        PlayerName = player.Name,
                        IsReady = isReady
                    });

                    // Vérifier si le lobby peut démarrer
                    bool canStart = await _lobbyService.CanStartGameAsync(lobbyId);
                    await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyCanStart", canStart);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de prêt pour le lobby {LobbyId}", lobbyId);
                await Clients.Caller.SendAsync("LobbyError", "Erreur lors de la mise à jour du statut de prêt");
            }
        }

        #endregion

        #region Gestion des parties

        /// <summary>
        /// Rejoint une partie
        /// </summary>
        public async Task JoinGame(string gameId, string playerId)
        {
            try
            {
                GameManager game = await _gameService.GetGameAsync(gameId);
                if (game == null)
                {
                    await Clients.Caller.SendAsync("GameError", "Partie introuvable");
                    return;
                }

                Player player = game.Players.FirstOrDefault(p => p.Id == playerId);
                if (player == null)
                {
                    await Clients.Caller.SendAsync("GameError", "Joueur introuvable");
                    return;
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, $"game_{gameId}");
                
                // Mettre à jour le statut de connexion
                player.UpdateConnectionStatus(true, Context.ConnectionId);
                await _gameService.GetGamePlayersAsync(gameId); // Sauvegarder les changements

                await Clients.Group($"game_{gameId}").SendAsync("PlayerJoinedGame", new
                {
                    PlayerId = player.Id,
                    PlayerName = player.Name,
                    IsAlive = player.IsAlive,
                    IsConnected = player.IsConnected,
                    ConnectionId = Context.ConnectionId
                });

                _logger.LogInformation("Joueur {PlayerName} a rejoint la partie {GameId}", player.Name, gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la jonction à la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors de la jonction à la partie");
            }
        }

        /// <summary>
        /// Quitte une partie
        /// </summary>
        public async Task LeaveGame(string gameId, string playerId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game_{gameId}");
                
                // Mettre à jour le statut de connexion
                Player player = await _gameService.GetPlayerAsync(gameId, playerId);
                if (player != null)
                {
                    player.UpdateConnectionStatus(false, null);
                }

                await Clients.Group($"game_{gameId}").SendAsync("PlayerLeftGame", new
                {
                    PlayerId = playerId,
                    ConnectionId = Context.ConnectionId
                });

                _logger.LogInformation("Joueur {PlayerId} a quitté la partie {GameId}", playerId, gameId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sortie de la partie {GameId}", gameId);
            }
        }

        /// <summary>
        /// Soumet un vote
        /// </summary>
        public async Task SubmitVote(string gameId, string voterId, string targetPlayerId, VoteType voteType)
        {
            try
            {
                bool success = await _gameService.SubmitVoteAsync(gameId, voterId, targetPlayerId, voteType);
                if (!success)
                {
                    await Clients.Caller.SendAsync("GameError", "Impossible de soumettre le vote");
                    return;
                }

                Player voter = await _gameService.GetPlayerAsync(gameId, voterId);
                Player target = await _gameService.GetPlayerAsync(gameId, targetPlayerId);

                if (voter != null && target != null)
                {
                    await Clients.Group($"game_{gameId}").SendAsync("VoteSubmitted", new
                    {
                        VoterId = voterId,
                        VoterName = voter.Name,
                        TargetPlayerId = targetPlayerId,
                        TargetPlayerName = target.Name,
                        VoteType = voteType.ToString(),
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la soumission du vote pour la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors de la soumission du vote");
            }
        }

        /// <summary>
        /// Sélectionne une chaise
        /// </summary>
        public async Task SelectChair(string gameId, string playerId, int chairNumber)
        {
            try
            {
                bool success = await _gameService.SelectChairAsync(gameId, playerId, chairNumber);
                if (!success)
                {
                    await Clients.Caller.SendAsync("GameError", "Impossible de sélectionner la chaise");
                    return;
                }

                Player player = await _gameService.GetPlayerAsync(gameId, playerId);
                if (player != null)
                {
                    await Clients.Group($"game_{gameId}").SendAsync("ChairSelected", new
                    {
                        PlayerId = playerId,
                        PlayerName = player.Name,
                        ChairNumber = chairNumber,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sélection de chaise pour la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors de la sélection de chaise");
            }
        }

        /// <summary>
        /// Envoie un message de jeu
        /// </summary>
        public async Task SendGameMessage(string gameId, string playerId, string content, MessageType messageType)
        {
            try
            {
                bool success = await _gameService.SendGameMessageAsync(gameId, playerId, content, messageType);
                if (!success)
                {
                    await Clients.Caller.SendAsync("GameError", "Impossible d'envoyer le message");
                    return;
                }

                Player player = await _gameService.GetPlayerAsync(gameId, playerId);
                if (player != null)
                {
                    // Envoyer le message selon le type
                    string groupName = messageType switch
                    {
                        MessageType.WolfChat => $"game_{gameId}_wolves",
                        MessageType.Ghost => $"game_{gameId}_ghosts",
                        MessageType.MediumChat => $"game_{gameId}_medium",
                        _ => $"game_{gameId}"
                    };

                    await Clients.Group(groupName).SendAsync("GameMessage", new
                    {
                        Id = Guid.NewGuid().ToString(),
                        PlayerId = playerId,
                        PlayerName = player.Name,
                        Content = content,
                        MessageType = messageType.ToString(),
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi du message de jeu pour la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors de l'envoi du message");
            }
        }

        /// <summary>
        /// Effectue une action de joueur
        /// </summary>
        public async Task ProcessPlayerAction(string gameId, string playerId, string actionType, string? targetPlayerId = null, Dictionary<string, object>? data = null)
        {
            try
            {
                GamePhase currentPhase = await _gameService.GetCurrentPhaseAsync(gameId);
                GameActionContext context = new GameActionContext
                {
                    PlayerId = playerId,
                    GameId = gameId,
                    CurrentPhase = currentPhase,
                    TargetPlayerId = targetPlayerId,
                    AdditionalData = data ?? new Dictionary<string, object>()
                };

                GameActionResult result = await _gameService.ProcessPlayerActionAsync(gameId, playerId, context);
                
                if (result.Success)
                {
                    await Clients.Group($"game_{gameId}").SendAsync("PlayerActionProcessed", new
                    {
                        PlayerId = playerId,
                        ActionType = actionType,
                        TargetPlayerId = targetPlayerId,
                        Result = result,
                        Timestamp = DateTime.UtcNow
                    });
                }
                else
                {
                    await Clients.Caller.SendAsync("GameError", result.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du traitement de l'action du joueur pour la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors du traitement de l'action");
            }
        }

        #endregion

        #region Gestion des phases

        /// <summary>
        /// Change la phase de la partie
        /// </summary>
        public async Task ChangeGamePhase(string gameId, GamePhase newPhase)
        {
            try
            {
                bool success = await _gameService.ChangeGamePhaseAsync(gameId, newPhase);
                if (!success)
                {
                    await Clients.Caller.SendAsync("GameError", "Impossible de changer la phase");
                    return;
                }

                await Clients.Group($"game_{gameId}").SendAsync("PhaseChanged", new
                {
                    GameId = gameId,
                    NewPhase = newPhase.ToString(),
                    Timestamp = DateTime.UtcNow
                });

                _logger.LogInformation("Phase changée pour la partie {GameId} : {NewPhase}", gameId, newPhase);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du changement de phase pour la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors du changement de phase");
            }
        }

        /// <summary>
        /// Met à jour le timer de la partie
        /// </summary>
        public async Task UpdateGameTimer(string gameId, int timeRemaining)
        {
            try
            {
                bool success = await _gameService.UpdateGameTimerAsync(gameId, timeRemaining);
                if (!success)
                {
                    await Clients.Caller.SendAsync("GameError", "Impossible de mettre à jour le timer");
                    return;
                }

                await Clients.Group($"game_{gameId}").SendAsync("TimerUpdated", new
                {
                    GameId = gameId,
                    TimeRemaining = timeRemaining,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du timer pour la partie {GameId}", gameId);
                await Clients.Caller.SendAsync("GameError", "Erreur lors de la mise à jour du timer");
            }
        }

        #endregion

        #region Méthodes privées

        /// <summary>
        /// Met à jour le statut de connexion d'un joueur
        /// </summary>
        private async Task UpdatePlayerConnectionStatus(string connectionId, bool isConnected)
        {
            // Cette méthode devrait être implémentée pour mettre à jour le statut de connexion
            // des joueurs dans toutes les parties et lobbys
            await Task.CompletedTask;
        }

        /// <summary>
        /// Met à jour le statut de connexion d'un joueur de lobby
        /// </summary>
        private async Task UpdateLobbyPlayerConnectionStatus(string lobbyId, string userId, bool isConnected, string? connectionId)
        {
            // Cette méthode devrait être implémentée pour mettre à jour le statut de connexion
            // des joueurs dans les lobbys
            await Task.CompletedTask;
        }

        #endregion
    }
}
