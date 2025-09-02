using Microsoft.AspNetCore.Mvc;
using WendigoGame.API.Models;

using WendigoGame.API.Services;

namespace WendigoGame.API.Controllers
{
    /// <summary>
    /// Contrôleur pour la gestion des parties
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GameController> _logger;

        public GameController(IGameService gameService, ILogger<GameController> logger)
        {
            _gameService = gameService;
            _logger = logger;
        }

        /// <summary>
        /// Obtient toutes les parties actives
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<GameManager>>> GetActiveGames()
        {
            try
            {
                List<GameManager> games = await _gameService.GetActiveGamesAsync();
                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des parties actives");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient une partie par son ID
        /// </summary>
        [HttpGet("{gameId}")]
        public async Task<ActionResult<GameManager>> GetGame(string gameId)
        {
            try
            {
                GameManager game = await _gameService.GetGameAsync(gameId);
                if (game == null)
                    return NotFound("Partie introuvable");

                return Ok(game);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Démarre une partie
        /// </summary>
        [HttpPost("{gameId}/start")]
        public async Task<ActionResult> StartGame(string gameId)
        {
            try
            {
                bool success = await _gameService.StartGameAsync(gameId);
                if (!success)
                    return BadRequest("Impossible de démarrer la partie");

                return Ok(new { message = "Partie démarrée avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du démarrage de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Termine une partie
        /// </summary>
        [HttpPost("{gameId}/end")]
        public async Task<ActionResult> EndGame(string gameId)
        {
            try
            {
                bool success = await _gameService.EndGameAsync(gameId);
                if (!success)
                    return BadRequest("Impossible de terminer la partie");

                return Ok(new { message = "Partie terminée avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la fin de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les joueurs d'une partie
        /// </summary>
        [HttpGet("{gameId}/players")]
        public async Task<ActionResult<List<Player>>> GetGamePlayers(string gameId)
        {
            try
            {
                List<Player> players = await _gameService.GetGamePlayersAsync(gameId);
                return Ok(players);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des joueurs de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient un joueur spécifique
        /// </summary>
        [HttpGet("{gameId}/players/{playerId}")]
        public async Task<ActionResult<Player>> GetPlayer(string gameId, string playerId)
        {
            try
            {
                Player player = await _gameService.GetPlayerAsync(gameId, playerId);
                if (player == null)
                    return NotFound("Joueur introuvable");

                return Ok(player);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du joueur {PlayerId} de la partie {GameId}", playerId, gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Change la phase de la partie
        /// </summary>
        [HttpPost("{gameId}/phase")]
        public async Task<ActionResult> ChangeGamePhase(string gameId, [FromBody] ChangePhaseRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.ChangeGamePhaseAsync(gameId, request.NewPhase);
                if (!success)
                    return BadRequest("Impossible de changer la phase");

                return Ok(new { message = "Phase changée avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du changement de phase de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Met à jour le timer de la partie
        /// </summary>
        [HttpPut("{gameId}/timer")]
        public async Task<ActionResult> UpdateGameTimer(string gameId, [FromBody] UpdateTimerRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.UpdateGameTimerAsync(gameId, request.TimeRemaining);
                if (!success)
                    return BadRequest("Impossible de mettre à jour le timer");

                return Ok(new { message = "Timer mis à jour avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du timer de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient la phase actuelle de la partie
        /// </summary>
        [HttpGet("{gameId}/phase")]
        public async Task<ActionResult<GamePhase>> GetCurrentPhase(string gameId)
        {
            try
            {
                GamePhase phase = await _gameService.GetCurrentPhaseAsync(gameId);
                return Ok(phase);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la phase de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Soumet un vote
        /// </summary>
        [HttpPost("{gameId}/vote")]
        public async Task<ActionResult> SubmitVote(string gameId, [FromBody] SubmitVoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.SubmitVoteAsync(gameId, request.VoterId, request.TargetPlayerId, request.VoteType);
                if (!success)
                    return BadRequest("Impossible de soumettre le vote");

                return Ok(new { message = "Vote soumis avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la soumission du vote pour la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les votes d'une partie
        /// </summary>
        [HttpGet("{gameId}/votes")]
        public async Task<ActionResult<List<Vote>>> GetGameVotes(string gameId)
        {
            try
            {
                List<Vote> votes = await _gameService.GetGameVotesAsync(gameId);
                return Ok(votes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des votes de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les résultats des votes
        /// </summary>
        [HttpGet("{gameId}/votes/results")]
        public async Task<ActionResult<Dictionary<string, int>>> GetVoteResults(string gameId)
        {
            try
            {
                Dictionary<string, int> results = await _gameService.GetVoteResultsAsync(gameId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des résultats de vote de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Traite les résultats des votes
        /// </summary>
        [HttpPost("{gameId}/votes/process")]
        public async Task<ActionResult> ProcessVoteResults(string gameId)
        {
            try
            {
                bool success = await _gameService.ProcessVoteResultsAsync(gameId);
                if (!success)
                    return BadRequest("Impossible de traiter les résultats des votes");

                return Ok(new { message = "Résultats des votes traités avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du traitement des résultats de vote de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Sélectionne une chaise
        /// </summary>
        [HttpPost("{gameId}/chair")]
        public async Task<ActionResult> SelectChair(string gameId, [FromBody] SelectChairRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.SelectChairAsync(gameId, request.PlayerId, request.ChairNumber);
                if (!success)
                    return BadRequest("Impossible de sélectionner la chaise");

                return Ok(new { message = "Chaise sélectionnée avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sélection de chaise pour la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Effectue une action de joueur
        /// </summary>
        [HttpPost("{gameId}/action")]
        public async Task<ActionResult<GameActionResult>> ProcessPlayerAction(string gameId, [FromBody] PlayerActionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                GameActionContext context = new GameActionContext
                {
                    PlayerId = request.PlayerId,
                    GameId = gameId,
                    CurrentPhase = request.CurrentPhase,
                    TargetPlayerId = request.TargetPlayerId,
                    ChairNumber = request.ChairNumber,
                    Message = request.Message,
                    AdditionalData = request.AdditionalData ?? new Dictionary<string, object>()
                };

                GameActionResult result = await _gameService.ProcessPlayerActionAsync(gameId, request.PlayerId, context);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du traitement de l'action du joueur pour la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les événements d'une partie
        /// </summary>
        [HttpGet("{gameId}/events")]
        public async Task<ActionResult<List<GameEvent>>> GetGameEvents(string gameId)
        {
            try
            {
                List<GameEvent> events = await _gameService.GetGameEventsAsync(gameId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des événements de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Envoie un message de jeu
        /// </summary>
        [HttpPost("{gameId}/message")]
        public async Task<ActionResult> SendGameMessage(string gameId, [FromBody] SendGameMessageRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.SendGameMessageAsync(gameId, request.PlayerId, request.Content, request.MessageType);
                if (!success)
                    return BadRequest("Impossible d'envoyer le message");

                return Ok(new { message = "Message envoyé avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi du message pour la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les messages d'une partie
        /// </summary>
        [HttpGet("{gameId}/messages")]
        public async Task<ActionResult<List<GameMessage>>> GetGameMessages(string gameId, [FromQuery] MessageType? messageType = null)
        {
            try
            {
                List<GameMessage> messages = await _gameService.GetGameMessagesAsync(gameId, messageType);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des messages de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Ajoute une note de joueur
        /// </summary>
        [HttpPost("{gameId}/notes")]
        public async Task<ActionResult> AddPlayerNote(string gameId, [FromBody] AddPlayerNoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.AddPlayerNoteAsync(gameId, request.PlayerId, request.TargetPlayerId, request.Content);
                if (!success)
                    return BadRequest("Impossible d'ajouter la note");

                return Ok(new { message = "Note ajoutée avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de la note pour la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les notes d'un joueur
        /// </summary>
        [HttpGet("{gameId}/players/{playerId}/notes")]
        public async Task<ActionResult<List<PlayerNote>>> GetPlayerNotes(string gameId, string playerId)
        {
            try
            {
                List<PlayerNote> notes = await _gameService.GetPlayerNotesAsync(gameId, playerId);
                return Ok(notes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des notes du joueur {PlayerId} de la partie {GameId}", playerId, gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Met à jour une note
        /// </summary>
        [HttpPut("notes/{noteId}")]
        public async Task<ActionResult> UpdatePlayerNote(string noteId, [FromBody] UpdatePlayerNoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _gameService.UpdatePlayerNoteAsync(noteId, request.Content);
                if (!success)
                    return BadRequest("Impossible de mettre à jour la note");

                return Ok(new { message = "Note mise à jour avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la note {NoteId}", noteId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient le rôle d'un joueur
        /// </summary>
        [HttpGet("{gameId}/players/{playerId}/role")]
        public async Task<ActionResult<IRole>> GetPlayerRole(string gameId, string playerId)
        {
            try
            {
                IRole role = await _gameService.GetPlayerRoleAsync(gameId, playerId);
                if (role == null)
                    return NotFound("Rôle introuvable");

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rôle du joueur {PlayerId} de la partie {GameId}", playerId, gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Vérifie si une partie est terminée
        /// </summary>
        [HttpGet("{gameId}/finished")]
        public async Task<ActionResult<bool>> IsGameFinished(string gameId)
        {
            try
            {
                bool isFinished = await _gameService.IsGameFinishedAsync(gameId);
                return Ok(isFinished);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de fin de partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient le gagnant d'une partie
        /// </summary>
        [HttpGet("{gameId}/winner")]
        public async Task<ActionResult<string?>> GetGameWinner(string gameId)
        {
            try
            {
                string winner = await _gameService.GetGameWinnerAsync(gameId);
                return Ok(winner);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du gagnant de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les statistiques d'une partie
        /// </summary>
        [HttpGet("{gameId}/statistics")]
        public async Task<ActionResult<GameStatistics>> GetGameStatistics(string gameId)
        {
            try
            {
                GameStatistics statistics = await _gameService.GetGameStatisticsAsync(gameId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les statistiques des joueurs d'une partie
        /// </summary>
        [HttpGet("{gameId}/players/statistics")]
        public async Task<ActionResult<List<PlayerStatistics>>> GetPlayerStatistics(string gameId)
        {
            try
            {
                List<PlayerStatistics> statistics = await _gameService.GetPlayerStatisticsAsync(gameId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques des joueurs de la partie {GameId}", gameId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }
    }

    #region DTOs

    public class ChangePhaseRequest
    {
        public GamePhase NewPhase { get; set; }
    }

    public class UpdateTimerRequest
    {
        public int TimeRemaining { get; set; }
    }

    public class SubmitVoteRequest
    {
        public string VoterId { get; set; } = string.Empty;
        public string TargetPlayerId { get; set; } = string.Empty;
        public VoteType VoteType { get; set; }
    }

    public class SelectChairRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public int ChairNumber { get; set; }
    }

    public class PlayerActionRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public GamePhase CurrentPhase { get; set; }
        public string? TargetPlayerId { get; set; }
        public int? ChairNumber { get; set; }
        public string? Message { get; set; }
        public Dictionary<string, object>? AdditionalData { get; set; }
    }

    public class SendGameMessageRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public MessageType MessageType { get; set; }
    }

    public class AddPlayerNoteRequest
    {
        public string PlayerId { get; set; } = string.Empty;
        public string TargetPlayerId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class UpdatePlayerNoteRequest
    {
        public string Content { get; set; } = string.Empty;
    }

    #endregion
}
