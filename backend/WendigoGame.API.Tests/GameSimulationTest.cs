using Xunit;
using WendigoGame.API.Models;
using WendigoGame.API.Models.Roles;

namespace WendigoGame.API.Tests
{
    /// <summary>
    /// Test unitaire pour simuler une partie complète du jeu Wendigo
    /// </summary>
    public class GameSimulationTest
    {
        [Fact]
        public void SystemeDeRoles_DevraitFonctionnerCorrectement()
        {
            // Arrange
            Loup loup = new Loup();
            Villageois villageois = new Villageois();

            // Act & Assert
            // Test des propriétés des rôles
            Assert.Equal("Loup", loup.Name);
            Assert.Equal(Team.Wolves, loup.Team);
            Assert.Equal("Villageois", villageois.Name);
            Assert.Equal(Team.Village, villageois.Team);

            // Test des pouvoirs
            GameActionContext context = new GameActionContext
            {
                PlayerId = "test-player",
                GameId = "test-game",
                CurrentPhase = GamePhase.Night // Le loup peut utiliser son pouvoir la nuit
            };

            Assert.True(loup.CanUsePower(context));
            Assert.False(villageois.CanUsePower(context));
        }

        [Fact]
        public void GameManager_DevraitGererLesOperationsDeBase()
        {
            // Arrange
            GameManager gameManager = new GameManager();

            // Act & Assert
            // Test du nombre de joueurs initial
            Assert.Equal(0, gameManager.NombreDeJoueur());

            // Test de la création de personnages
            List<Player> players = gameManager.CreatePerso(2);
            Assert.NotNull(players);
            Assert.Equal(2, players.Count);
            Assert.Equal(2, gameManager.NombreDeJoueur());
        }

        [Fact]
        public void Joueur_DevraitFonctionnerCorrectement()
        {
            // Arrange
            Player player = new Player
            {
                Name = "TestPlayer",
                Role = new Loup(),
                IsAlive = true,
                IsReady = true
            };

            // Act & Assert
            Assert.Equal("TestPlayer", player.Name);
            Assert.True(player.IsAlive);
            Assert.True(player.IsReady);
            Assert.Equal(Team.Wolves, player.Team);
            Assert.True(player.Playing());
        }

        [Fact]
        public void ContexteActionJeu_DevraitFonctionnerCorrectement()
        {
            // Arrange
            GameActionContext context = new GameActionContext
            {
                PlayerId = "player1",
                GameId = "game1",
                AdditionalData = new Dictionary<string, object> { { "test", "value" } }
            };

            // Act & Assert
            Assert.Equal("player1", context.PlayerId);
            Assert.Equal("game1", context.GameId);
            Assert.NotNull(context.AdditionalData);
            Assert.Equal("value", context.AdditionalData["test"]);
        }

        [Fact]
        public void ResultatActionJeu_DevraitFonctionnerCorrectement()
        {
            // Arrange & Act
            GameActionResult successResult = GameActionResult.SuccessResult("Test réussi");
            GameActionResult failureResult = GameActionResult.FailureResult("Test échoué");

            // Assert
            Assert.True(successResult.Success);
            Assert.Equal("Test réussi", successResult.Message);
            Assert.False(failureResult.Success);
            Assert.Equal("Test échoué", failureResult.Message);
        }

        [Fact]
        public void Lobby_DevraitFonctionnerCorrectement()
        {
            // Arrange
            Lobby lobby = new Lobby
            {
                Name = "Test Lobby",
                MinPlayers = 8,
                MaxPlayers = 8,
                CreatorId = "creator1"
            };

            // Act & Assert
            Assert.Equal("Test Lobby", lobby.Name);
            Assert.Equal(8, lobby.MinPlayers);
            Assert.Equal(8, lobby.MaxPlayers);
            Assert.False(lobby.IsFull);
            Assert.False(lobby.CanStart);

            // Test d'ajout de joueur
            LobbyPlayer player = new LobbyPlayer
            {
                UserId = "player1",
                Name = "Player1"
            };

            Assert.True(lobby.AddPlayer(player));
            Assert.Equal(1, lobby.Players.Count);
            Assert.False(lobby.IsFull);
            Assert.False(lobby.CanStart);
        }

        [Fact]
        public void Jeu_DevraitFonctionnerCorrectement()
        {
            // Arrange
            Game game = new Game
            {
                Name = "Test Game",
                Status = GameStatus.Waiting,
                CurrentPhase = GamePhase.Day
            };

            // Act & Assert
            Assert.Equal("Test Game", game.Name);
            Assert.Equal(GameStatus.Waiting, game.Status);
            Assert.Equal(GamePhase.Day, game.CurrentPhase);
            Assert.NotNull(game.Players);
            Assert.NotNull(game.GameEvents);
            Assert.NotNull(game.GameMessages);
            Assert.NotNull(game.Settings);
        }
    }
}
