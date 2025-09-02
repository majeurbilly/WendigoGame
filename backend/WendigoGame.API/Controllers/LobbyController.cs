using Microsoft.AspNetCore.Mvc;
using WendigoGame.API.Models;
using WendigoGame.API.Services;

namespace WendigoGame.API.Controllers
{
    /// <summary>
    /// Contrôleur pour la gestion des lobbys
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class LobbyController : ControllerBase
    {
        private readonly ILobbyService _lobbyService;
        private readonly ILogger<LobbyController> _logger;

        public LobbyController(ILobbyService lobbyService, ILogger<LobbyController> logger)
        {
            _lobbyService = lobbyService;
            _logger = logger;
        }

        /// <summary>
        /// Obtient tous les lobbys actifs
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Lobby>>> GetLobbies()
        {
            try
            {
                List<Lobby> lobbies = await _lobbyService.GetActiveLobbiesAsync();
                return Ok(lobbies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des lobbys");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient un lobby par son ID
        /// </summary>
        [HttpGet("{lobbyId}")]
        public async Task<ActionResult<Lobby>> GetLobby(string lobbyId)
        {
            try
            {
                Lobby lobby = await _lobbyService.GetLobbyAsync(lobbyId);
                if (lobby == null)
                    return NotFound("Lobby introuvable");

                return Ok(lobby);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Crée un nouveau lobby
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Lobby>> CreateLobby([FromBody] CreateLobbyRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                Lobby lobby = await _lobbyService.CreateLobbyAsync(
                    request.CreatorId,
                    request.Name,
                    request.Description,
                    request.MinPlayers,
                    request.MaxPlayers,
                    request.Password
                );

                return CreatedAtAction(nameof(GetLobby), new { lobbyId = lobby.Id }, lobby);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du lobby");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Met à jour un lobby
        /// </summary>
        [HttpPut("{lobbyId}")]
        public async Task<ActionResult> UpdateLobby(string lobbyId, [FromBody] UpdateLobbyRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _lobbyService.UpdateLobbyAsync(
                    lobbyId,
                    request.UserId,
                    request.Name,
                    request.Description,
                    request.MinPlayers,
                    request.MaxPlayers,
                    request.Password
                );

                if (!success)
                    return NotFound("Lobby introuvable ou vous n'êtes pas le créateur");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Supprime un lobby
        /// </summary>
        [HttpDelete("{lobbyId}")]
        public async Task<ActionResult> DeleteLobby(string lobbyId, [FromQuery] string userId)
        {
            try
            {
                bool success = await _lobbyService.DeleteLobbyAsync(lobbyId, userId);
                if (!success)
                    return NotFound("Lobby introuvable ou vous n'êtes pas le créateur");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Rejoint un lobby
        /// </summary>
        [HttpPost("{lobbyId}/join")]
        public async Task<ActionResult> JoinLobby(string lobbyId, [FromBody] JoinLobbyRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _lobbyService.JoinLobbyAsync(lobbyId, request.UserId, request.PlayerName, request.Password);
                if (!success)
                    return BadRequest("Impossible de rejoindre le lobby");

                return Ok(new { message = "Joueur ajouté au lobby avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la jonction au lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Quitte un lobby
        /// </summary>
        [HttpPost("{lobbyId}/leave")]
        public async Task<ActionResult> LeaveLobby(string lobbyId, [FromBody] LeaveLobbyRequest request)
        {
            try
            {
                bool success = await _lobbyService.LeaveLobbyAsync(lobbyId, request.UserId);
                if (!success)
                    return BadRequest("Impossible de quitter le lobby");

                return Ok(new { message = "Joueur retiré du lobby avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sortie du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Met à jour le statut de prêt d'un joueur
        /// </summary>
        [HttpPut("{lobbyId}/ready")]
        public async Task<ActionResult> UpdatePlayerReady(string lobbyId, [FromBody] UpdatePlayerReadyRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _lobbyService.UpdatePlayerReadyAsync(lobbyId, request.UserId, request.IsReady);
                if (!success)
                    return BadRequest("Impossible de mettre à jour le statut de prêt");

                return Ok(new { message = "Statut de prêt mis à jour avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de prêt pour le lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les joueurs d'un lobby
        /// </summary>
        [HttpGet("{lobbyId}/players")]
        public async Task<ActionResult<List<LobbyPlayer>>> GetLobbyPlayers(string lobbyId)
        {
            try
            {
                List<LobbyPlayer> players = await _lobbyService.GetLobbyPlayersAsync(lobbyId);
                return Ok(players);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des joueurs du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les messages d'un lobby
        /// </summary>
        [HttpGet("{lobbyId}/messages")]
        public async Task<ActionResult<List<LobbyMessage>>> GetLobbyMessages(string lobbyId, [FromQuery] int count = 50)
        {
            try
            {
                List<LobbyMessage> messages = await _lobbyService.GetLobbyMessagesAsync(lobbyId, count);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des messages du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Envoie un message dans un lobby
        /// </summary>
        [HttpPost("{lobbyId}/messages")]
        public async Task<ActionResult> SendLobbyMessage(string lobbyId, [FromBody] SendLobbyMessageRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool success = await _lobbyService.SendLobbyMessageAsync(lobbyId, request.UserId, request.Content);
                if (!success)
                    return BadRequest("Impossible d'envoyer le message");

                return Ok(new { message = "Message envoyé avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi du message dans le lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Démarre une partie depuis un lobby
        /// </summary>
        [HttpPost("{lobbyId}/start")]
        public async Task<ActionResult<GameManager>> StartGame(string lobbyId, [FromBody] StartGameRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool canStart = await _lobbyService.CanStartGameAsync(lobbyId);
                if (!canStart)
                    return BadRequest("Le lobby ne peut pas démarrer une partie");

                GameManager game = await _lobbyService.StartGameFromLobbyAsync(lobbyId, request.UserId);
                if (game == null)
                    return BadRequest("Impossible de démarrer la partie");

                return Ok(game);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du démarrage de la partie depuis le lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient les statistiques d'un lobby
        /// </summary>
        [HttpGet("{lobbyId}/statistics")]
        public async Task<ActionResult<LobbyStatistics>> GetLobbyStatistics(string lobbyId)
        {
            try
            {
                LobbyStatistics statistics = await _lobbyService.GetLobbyStatisticsAsync(lobbyId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques du lobby {LobbyId}", lobbyId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        /// <summary>
        /// Obtient tous les lobbys d'un utilisateur
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Lobby>>> GetUserLobbies(string userId)
        {
            try
            {
                List<Lobby> lobbies = await _lobbyService.GetLobbiesByUserAsync(userId);
                return Ok(lobbies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des lobbys de l'utilisateur {UserId}", userId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }
    }

    #region DTOs

    public class CreateLobbyRequest
    {
        public string CreatorId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MinPlayers { get; set; } = 8;
        public int MaxPlayers { get; set; } = 29;
        public string? Password { get; set; }
    }

    public class UpdateLobbyRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? MinPlayers { get; set; }
        public int? MaxPlayers { get; set; }
        public string? Password { get; set; }
    }

    public class JoinLobbyRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string PlayerName { get; set; } = string.Empty;
        public string? Password { get; set; }
    }

    public class LeaveLobbyRequest
    {
        public string UserId { get; set; } = string.Empty;
    }

    public class UpdatePlayerReadyRequest
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsReady { get; set; }
    }

    public class SendLobbyMessageRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class StartGameRequest
    {
        public string UserId { get; set; } = string.Empty;
    }

    #endregion
}
