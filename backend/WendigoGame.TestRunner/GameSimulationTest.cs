using WendigoGame.API.Models;
using WendigoGame.API.Models.Roles;

namespace WendigoGame.TestRunner
{
    /// <summary>
    /// Test avancé pour simuler une partie complète du jeu Wendigo
    /// </summary>
    public class GameSimulationTest
    {
        private readonly GameManager _gameManager;
        private readonly List<Player> _players;

        public GameSimulationTest()
        {
            _gameManager = new GameManager();
            _players = new List<Player>();
        }

        public async Task SimulerPartieComplete()
        {
            Console.WriteLine("=== Simulation d'une partie complète Wendigo ===");

            try
            {
                // 1. Création des joueurs
                CreerJoueursDeTest();
                Console.WriteLine($"✓ {_players.Count} joueurs créés");

                // 2. Ajout des joueurs au GameManager
                foreach (Player player in _players)
                {
                    _gameManager.Players.Add(player);
                }
                Console.WriteLine($"✓ Joueurs ajoutés au GameManager");

                // 3. Démarrage de la partie
                _gameManager.Status = GameStatus.Playing;
                _gameManager.CurrentPhase = GamePhase.Day;
                Console.WriteLine($"✓ Partie démarrée - Phase: {_gameManager.CurrentPhase}");

                // 4. Simulation des phases de jeu
                await SimulerPhasesDeJeu();

                // 5. Fin de partie
                Console.WriteLine($"✓ Partie terminée - Statut: {_gameManager.Status}");

                Console.WriteLine("=== Simulation terminée avec succès ! ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur lors de la simulation: {ex.Message}");
                throw;
            }
        }

        private void CreerJoueursDeTest()
        {
            List<IRole> roles = new List<IRole>
            {
                new Loup(), new Loup(), // 2 Loups
                new Villageois(), new Villageois(), new Villageois(), 
                new Villageois(), new Villageois(), new Villageois() // 6 Villageois
            };

            for (int i = 0; i < 8; i++)
            {
                Player player = new Player
                {
                    Name = $"Joueur{i + 1}",
                    Role = roles[i],
                    IsReady = true,
                    SelectedChair = i + 1,
                    IsAlive = true
                };
                _players.Add(player);
            }
        }

        private async Task SimulerPhasesDeJeu()
        {
            Console.WriteLine("\n--- Simulation des phases de jeu ---");

            // Phase Jour - Sélection des chaises
            await SimulerPhaseJour();
            Console.WriteLine("✓ Phase Jour terminée");

            // Phase Soir - Vote d'accusation
            await SimulerPhaseSoir();
            Console.WriteLine("✓ Phase Soir terminée");

            // Phase Nuit - Actions des rôles
            await SimulerPhaseNuit();
            Console.WriteLine("✓ Phase Nuit terminée");

            // Phase Réveil - Annonce des morts
            await SimulerPhaseReveil();
            Console.WriteLine("✓ Phase Réveil terminée");
        }

        private async Task SimulerPhaseJour()
        {
            Console.WriteLine("  🌅 Phase Jour - Sélection des chaises...");
            
            List<Player> alivePlayers = _players.Where(p => p.IsAlive).ToList();
            
            foreach (Player player in alivePlayers)
            {
                Console.WriteLine($"    ✓ {player.Name} a sélectionné la chaise {player.SelectedChair}");
            }
            
            await Task.Delay(100); // Simulation d'un délai
        }

        private async Task SimulerPhaseSoir()
        {
            Console.WriteLine("  🌆 Phase Soir - Vote d'accusation...");
            
            List<Player> alivePlayers = _players.Where(p => p.IsAlive).ToList();
            Player targetPlayer = alivePlayers.First(p => p.Role is Villageois);

            // Simulation d'un vote majoritaire contre un villageois
            List<Player> voters = alivePlayers.Take(5).ToList();
            
            foreach (Player voter in voters)
            {
                Console.WriteLine($"    ✓ {voter.Name} a voté contre {targetPlayer.Name}");
            }

            // Simuler la mort du joueur accusé
            targetPlayer.IsAlive = false;
            
            Console.WriteLine($"    💀 {targetPlayer.Name} a été condamné et exécuté !");
            
            await Task.Delay(100); // Simulation d'un délai
        }

        private async Task SimulerPhaseNuit()
        {
            Console.WriteLine("  🌙 Phase Nuit - Actions des loups...");
            
            List<Player> wolves = _players.Where(p => p.IsAlive && p.Role is Loup).ToList();
            List<Player> aliveVillagers = _players.Where(p => p.IsAlive && p.Role is Villageois).ToList();
            
            if (wolves.Any() && aliveVillagers.Any())
            {
                Player targetVillager = aliveVillagers.First();

                foreach (Player wolf in wolves)
                {
                    Console.WriteLine($"    ✓ {wolf.Name} a voté pour tuer {targetVillager.Name}");
                }

                // Simuler la mort de la victime
                targetVillager.IsAlive = false;
                
                Console.WriteLine($"    💀 {targetVillager.Name} a été tué par les loups !");
            }
            
            await Task.Delay(100); // Simulation d'un délai
        }

        private async Task SimulerPhaseReveil()
        {
            Console.WriteLine("  🌅 Phase Réveil - Annonce des morts...");
            
            List<Player> deadPlayers = _players.Where(p => !p.IsAlive).ToList();
            
            foreach (Player deadPlayer in deadPlayers)
            {
                Console.WriteLine($"    💀 {deadPlayer.Name} ({deadPlayer.Role.Name}) est mort cette nuit");
            }

            // Vérifier les conditions de victoire
            int aliveWolves = _players.Count(p => p.IsAlive && p.Role is Loup);
            int aliveVillagers = _players.Count(p => p.IsAlive && p.Role is Villageois);

            Console.WriteLine($"    📊 Joueurs vivants: {aliveWolves} Loups, {aliveVillagers} Villageois");

            if (aliveWolves >= aliveVillagers)
            {
                Console.WriteLine("    🐺 Les Loups ont gagné !");
                _gameManager.Status = GameStatus.Finished;
            }
            else if (aliveWolves == 0)
            {
                Console.WriteLine("    🏘️ Les Villageois ont gagné !");
                _gameManager.Status = GameStatus.Finished;
            }
            else
            {
                Console.WriteLine("    ⏳ La partie continue...");
            }
            
            await Task.Delay(100); // Simulation d'un délai
        }


    }

    /// <summary>
    /// Classe pour exécuter la simulation de partie
    /// </summary>
    public class GameSimulationRunner
    {
        public static async Task ExecuterSimulation()
        {
            GameSimulationTest simulation = new GameSimulationTest();
            await simulation.SimulerPartieComplete();
        }
    }
}
