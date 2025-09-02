using WendigoGame.API.Models;
using WendigoGame.API.Models.Roles;

namespace WendigoGame.API.Tests
{
    /// <summary>
    /// Test manuel simple pour valider les fonctionnalités de base du jeu Wendigo
    /// </summary>
    public class ManualTest
    {
        public static void ExecuterTousLesTests()
        {
            Console.WriteLine("=== Tests manuels du jeu Wendigo ===");
            
            TesterSystemeDeRoles();
            TesterGameManager();
            TesterJoueur();
            TesterContexteActionJeu();
            TesterResultatActionJeu();
            TesterLobby();
            TesterJeu();
            TesterEnumerations();
            TesterParametresJeu();
            
            Console.WriteLine("=== Tous les tests sont passés avec succès ! ===");
        }

        private static void TesterSystemeDeRoles()
        {
            Console.WriteLine("Test du système de rôles...");
            
            Loup loup = new Loup();
            Villageois villageois = new Villageois();

            // Test des propriétés des rôles
            if (loup.Name != "Loup") throw new Exception("Erreur: Nom du loup incorrect");
            if (loup.Team != Team.Wolves) throw new Exception("Erreur: Équipe du loup incorrecte");
            if (villageois.Name != "Villageois") throw new Exception("Erreur: Nom du villageois incorrect");
            if (villageois.Team != Team.Village) throw new Exception("Erreur: Équipe du villageois incorrecte");

            // Test des pouvoirs
            GameActionContext context = new GameActionContext
            {
                PlayerId = "test-player",
                GameId = "test-game"
            };

            if (!loup.CanUsePower(context)) throw new Exception("Erreur: Le loup devrait pouvoir utiliser son pouvoir");
            if (villageois.CanUsePower(context)) throw new Exception("Erreur: Le villageois ne devrait pas pouvoir utiliser de pouvoir");
            
            Console.WriteLine("✓ Système de rôles OK");
        }

        private static void TesterGameManager()
        {
            Console.WriteLine("Test du GameManager...");
            
            GameManager gameManager = new GameManager();

            // Test du nombre de joueurs initial
            if (gameManager.NombreDeJoueur() != 0) throw new Exception("Erreur: Nombre de joueurs initial incorrect");

            // Test de la création de personnages
            List<Player> players = gameManager.CreatePerso(2);
            if (players == null) throw new Exception("Erreur: Liste de joueurs nulle");
            if (players.Count != 2) throw new Exception("Erreur: Nombre de joueurs créés incorrect");
            if (gameManager.NombreDeJoueur() != 2) throw new Exception("Erreur: Nombre de joueurs dans le manager incorrect");
            
            Console.WriteLine("✓ GameManager OK");
        }

        private static void TesterJoueur()
        {
            Console.WriteLine("Test du Player...");
            
            Player player = new Player
            {
                Name = "TestPlayer",
                Role = new Loup(),
                IsAlive = true,
                IsReady = true
            };

            if (player.Name != "TestPlayer") throw new Exception("Erreur: Nom du joueur incorrect");
            if (!player.IsAlive) throw new Exception("Erreur: Joueur devrait être en vie");
            if (!player.IsReady) throw new Exception("Erreur: Joueur devrait être prêt");
            if (player.Team != Team.Wolves) throw new Exception("Erreur: Équipe du joueur incorrecte");
            if (!player.Playing()) throw new Exception("Erreur: Joueur devrait pouvoir jouer");
            
            Console.WriteLine("✓ Player OK");
        }

        private static void TesterContexteActionJeu()
        {
            Console.WriteLine("Test du GameActionContext...");
            
            GameActionContext context = new GameActionContext
            {
                PlayerId = "player1",
                GameId = "game1",
                AdditionalData = new Dictionary<string, object> { { "test", "value" } }
            };

            if (context.PlayerId != "player1") throw new Exception("Erreur: PlayerId incorrect");
            if (context.GameId != "game1") throw new Exception("Erreur: GameId incorrect");
            if (context.AdditionalData == null) throw new Exception("Erreur: AdditionalData nul");
            if (context.AdditionalData["test"].ToString() != "value") throw new Exception("Erreur: Valeur dans AdditionalData incorrecte");
            
            Console.WriteLine("✓ GameActionContext OK");
        }

        private static void TesterResultatActionJeu()
        {
            Console.WriteLine("Test du GameActionResult...");
            
            GameActionResult successResult = GameActionResult.SuccessResult("Test réussi");
            GameActionResult failureResult = GameActionResult.FailureResult("Test échoué");

            if (!successResult.Success) throw new Exception("Erreur: Résultat de succès incorrect");
            if (successResult.Message != "Test réussi") throw new Exception("Erreur: Message de succès incorrect");
            if (failureResult.Success) throw new Exception("Erreur: Résultat d'échec incorrect");
            if (failureResult.Message != "Test échoué") throw new Exception("Erreur: Message d'échec incorrect");
            
            Console.WriteLine("✓ GameActionResult OK");
        }

        private static void TesterLobby()
        {
            Console.WriteLine("Test du Lobby...");
            
            Lobby lobby = new Lobby
            {
                Name = "Test Lobby",
                MinPlayers = 8,
                MaxPlayers = 8,
                CreatorId = "creator1"
            };

            if (lobby.Name != "Test Lobby") throw new Exception("Erreur: Nom du lobby incorrect");
            if (lobby.MinPlayers != 8) throw new Exception("Erreur: MinPlayers incorrect");
            if (lobby.MaxPlayers != 8) throw new Exception("Erreur: MaxPlayers incorrect");
            if (lobby.IsFull) throw new Exception("Erreur: Lobby ne devrait pas être plein");
            if (lobby.CanStart) throw new Exception("Erreur: Lobby ne devrait pas pouvoir démarrer");

            // Test d'ajout de joueur
            LobbyPlayer player = new LobbyPlayer
            {
                UserId = "player1",
                Name = "Player1"
            };

            if (!lobby.AddPlayer(player)) throw new Exception("Erreur: Impossible d'ajouter un joueur");
            if (lobby.Players.Count != 1) throw new Exception("Erreur: Nombre de joueurs dans le lobby incorrect");
            if (lobby.IsFull) throw new Exception("Erreur: Lobby ne devrait pas être plein avec 1 joueur");
            if (lobby.CanStart) throw new Exception("Erreur: Lobby ne devrait pas pouvoir démarrer avec 1 joueur");
            
            Console.WriteLine("✓ Lobby OK");
        }

        private static void TesterJeu()
        {
            Console.WriteLine("Test du Game...");
            
            Game game = new Game
            {
                Name = "Test Game",
                Status = GameStatus.Waiting,
                CurrentPhase = GamePhase.Day
            };

            if (game.Name != "Test Game") throw new Exception("Erreur: Nom du jeu incorrect");
            if (game.Status != GameStatus.Waiting) throw new Exception("Erreur: Statut du jeu incorrect");
            if (game.CurrentPhase != GamePhase.Day) throw new Exception("Erreur: Phase du jeu incorrecte");
            if (game.Players == null) throw new Exception("Erreur: Liste de joueurs nulle");
            if (game.GameEvents == null) throw new Exception("Erreur: Liste d'événements nulle");
            if (game.GameMessages == null) throw new Exception("Erreur: Liste de messages nulle");
            if (game.Settings == null) throw new Exception("Erreur: Paramètres nuls");
            
            Console.WriteLine("✓ Game OK");
        }

        private static void TesterEnumerations()
        {
            Console.WriteLine("Test des énumérations...");
            
            // Test des énumérations
            if ((int)Alignement.Good != 0) throw new Exception("Erreur: Valeur Alignement.Good incorrecte");
            if ((int)Alignement.Evil != 1) throw new Exception("Erreur: Valeur Alignement.Evil incorrecte");
            
            if ((int)Team.Village != 0) throw new Exception("Erreur: Valeur Team.Village incorrecte");
            if ((int)Team.Wolves != 1) throw new Exception("Erreur: Valeur Team.Wolves incorrecte");
            
            if ((int)GamePhase.Day != 0) throw new Exception("Erreur: Valeur GamePhase.Day incorrecte");
            if ((int)GamePhase.Evening != 1) throw new Exception("Erreur: Valeur GamePhase.Evening incorrecte");
            if ((int)GamePhase.Night != 2) throw new Exception("Erreur: Valeur GamePhase.Night incorrecte");
            if ((int)GamePhase.WakeUp != 3) throw new Exception("Erreur: Valeur GamePhase.WakeUp incorrecte");
            
            if ((int)GameStatus.Waiting != 0) throw new Exception("Erreur: Valeur GameStatus.Waiting incorrecte");
            if ((int)GameStatus.Playing != 1) throw new Exception("Erreur: Valeur GameStatus.Playing incorrecte");
            if ((int)GameStatus.Finished != 2) throw new Exception("Erreur: Valeur GameStatus.Finished incorrecte");
            
            Console.WriteLine("✓ Énumérations OK");
        }

        private static void TesterParametresJeu()
        {
            Console.WriteLine("Test des GameSettings...");
            
            GameSettings settings = new GameSettings();

            if (settings.MinPlayers != 8) throw new Exception("Erreur: MinPlayers par défaut incorrect");
            if (settings.MaxPlayers != 29) throw new Exception("Erreur: MaxPlayers par défaut incorrect");
            if (settings.DayPhaseDuration != TimeSpan.FromMinutes(10)) throw new Exception("Erreur: DayPhaseDuration par défaut incorrect");
            if (settings.EveningPhaseDuration != TimeSpan.FromMinutes(5)) throw new Exception("Erreur: EveningPhaseDuration par défaut incorrect");
            if (settings.NightPhaseDuration != TimeSpan.FromMinutes(3)) throw new Exception("Erreur: NightPhaseDuration par défaut incorrect");
            if (settings.WakeUpPhaseDuration != TimeSpan.FromMinutes(2)) throw new Exception("Erreur: WakeUpPhaseDuration par défaut incorrect");
            if (!settings.AllowGhostChat) throw new Exception("Erreur: AllowGhostChat par défaut incorrect");
            if (!settings.AllowWolfChat) throw new Exception("Erreur: AllowWolfChat par défaut incorrect");
            if (!settings.AllowMediumChat) throw new Exception("Erreur: AllowMediumChat par défaut incorrect");
            if (!settings.AllowNotes) throw new Exception("Erreur: AllowNotes par défaut incorrect");
            if (!settings.AllowVibration) throw new Exception("Erreur: AllowVibration par défaut incorrect");
            if (!settings.AllowNotifications) throw new Exception("Erreur: AllowNotifications par défaut incorrect");
            
            Console.WriteLine("✓ GameSettings OK");
        }
    }
}

