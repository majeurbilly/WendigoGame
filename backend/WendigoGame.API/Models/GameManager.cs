
using WendigoGame.API.Models.Roles;

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Gestionnaire de jeu selon le diagramme UML
    /// Contient players: List<player> et nbTurn: int
    /// </summary>
    public class GameManager
    {
        /// <summary>
        /// Liste des joueurs selon le diagramme UML
        /// </summary>
        public List<Player> Players { get; set; } = new();

        /// <summary>
        /// Nombre de tours selon le diagramme UML
        /// </summary>
        public int NbTurn { get; set; } = 0;

        /// <summary>
        /// ID de la partie
        /// </summary>
        public string GameId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Statut de la partie
        /// </summary>
        public GameStatus Status { get; set; } = GameStatus.Waiting;

        /// <summary>
        /// Phase actuelle du jeu
        /// </summary>
        public GamePhase CurrentPhase { get; set; } = GamePhase.Day;

        /// <summary>
        /// Temps restant dans la phase actuelle (en secondes)
        /// </summary>
        public int TimeRemaining { get; set; } = 0;

        /// <summary>
        /// Durée totale de la phase actuelle (en secondes)
        /// </summary>
        public int TotalTime { get; set; } = 0;

        /// <summary>
        /// Nombre maximum de tours
        /// </summary>
        public int MaxRounds { get; set; } = 50;

        /// <summary>
        /// Tour actuel
        /// </summary>
        public int CurrentRound { get; set; } = 1;

        /// <summary>
        /// Événements de la partie
        /// </summary>
        public List<GameEvent> Events { get; set; } = new();

        /// <summary>
        /// Votes de la partie
        /// </summary>
        public List<Vote> Votes { get; set; } = new();

        /// <summary>
        /// Messages de la partie
        /// </summary>
        public List<GameMessage> Messages { get; set; } = new();

        /// <summary>
        /// Date de création de la partie
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Date de dernière mise à jour
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Méthode NombreDeJoueur() selon le diagramme UML
        /// </summary>
        /// <returns>Le nombre de joueurs dans la partie</returns>
        public int NombreDeJoueur()
        {
            return Players.Count;
        }

        /// <summary>
        /// Méthode CreatePerso(int nbJoueur) selon le diagramme UML
        /// </summary>
        /// <param name="nbJoueur">Nombre de joueurs</param>
        /// <returns>Liste des joueurs créés</returns>
        public List<Player> CreatePerso(int nbJoueur)
        {
            List<Player> players = new List<Player>();
            List<IRole> roles = GenerateRolesForPlayerCount(nbJoueur);

            for (int i = 0; i < nbJoueur; i++)
            {
                Player player = new Player
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = $"Joueur {i + 1}",
                    Role = roles[i],
                    IsAlive = true,
                    IsReady = false,
                    GameId = GameId,
                    Color = GeneratePlayerColor(i)
                };

                players.Add(player);
            }

            Players = players;
            UpdatedAt = DateTime.UtcNow;

            return players;
        }

        /// <summary>
        /// Méthode PlayATurn() selon le diagramme UML
        /// </summary>
        public async Task PlayATurn()
        {
            NbTurn++;
            UpdatedAt = DateTime.UtcNow;

            // Logique de tour selon la phase
            switch (CurrentPhase)
            {
                case GamePhase.Day:
                    await ProcessDayPhase();
                    break;
                case GamePhase.Evening:
                    await ProcessEveningPhase();
                    break;
                case GamePhase.Night:
                    await ProcessNightPhase();
                    break;
                case GamePhase.WakeUp:
                    await ProcessWakeUpPhase();
                    break;
            }

            // Vérifier si la partie est terminée
            if (IsFinish())
            {
                Status = GameStatus.Finished;
                await EndGame();
            }
        }

        /// <summary>
        /// Méthode IsFinish() selon le diagramme UML
        /// </summary>
        /// <returns>True si la partie est terminée</returns>
        public bool IsFinish()
        {
            List<Player> alivePlayers = Players.Where(p => p.IsAlive).ToList();
            List<Player> aliveWolves = alivePlayers.Where(p => p.Team == Team.Wolves).ToList();
            List<Player> aliveVillagers = alivePlayers.Where(p => p.Team == Team.Village).ToList();

            // La partie se termine si :
            // 1. Il n'y a plus de loups vivants (villageois gagnent)
            // 2. Il n'y a plus de villageois vivants (loups gagnent)
            // 3. Le nombre maximum de tours est atteint
            return aliveWolves.Count == 0 || 
                   aliveVillagers.Count == 0 || 
                   CurrentRound >= MaxRounds;
        }

        /// <summary>
        /// Traite la phase jour
        /// </summary>
        private async Task ProcessDayPhase()
        {
            // Phase jour : 10 minutes
            TotalTime = 600; // 10 minutes en secondes
            TimeRemaining = TotalTime;

            // Les joueurs peuvent discuter et sélectionner des chaises
            // Les chaises deviennent sélectionnables à 8 minutes (120 secondes restantes)

            GameEvent dayEvent = new GameEvent
            {
                GameId = GameId,
                EventType = GameEventType.PhaseChanged,
                Description = "Phase jour commencée - Les joueurs peuvent discuter et sélectionner des chaises",
                Data = new Dictionary<string, object>
                {
                    ["phase"] = "Day",
                    ["duration"] = TotalTime,
                    ["chairSelectionTime"] = 120
                }
            };

            Events.Add(dayEvent);
            await Task.CompletedTask;
        }

        /// <summary>
        /// Traite la phase soir (Conseil du village)
        /// </summary>
        private async Task ProcessEveningPhase()
        {
            // Phase soir : Conseil du village
            TotalTime = 300; // 5 minutes en secondes
            TimeRemaining = TotalTime;

            GameEvent eveningEvent = new GameEvent
            {
                GameId = GameId,
                EventType = GameEventType.PhaseChanged,
                Description = "Phase soir commencée - Conseil du village",
                Data = new Dictionary<string, object>
                {
                    ["phase"] = "Evening",
                    ["duration"] = TotalTime
                }
            };

            Events.Add(eveningEvent);
            await Task.CompletedTask;
        }

        /// <summary>
        /// Traite la phase nuit
        /// </summary>
        private async Task ProcessNightPhase()
        {
            // Phase nuit : Actions des rôles
            TotalTime = 300; // 5 minutes en secondes
            TimeRemaining = TotalTime;

            // Réinitialiser les votes des loups
            foreach (Player player in Players.Where(p => p.Role is Loup))
            {
                if (player.Role is Loup loup)
                {
                    loup.ResetNightVote();
                }
            }

            GameEvent nightEvent = new GameEvent
            {
                GameId = GameId,
                EventType = GameEventType.PhaseChanged,
                Description = "Phase nuit commencée - Les rôles peuvent utiliser leurs pouvoirs",
                Data = new Dictionary<string, object>
                {
                    ["phase"] = "Night",
                    ["duration"] = TotalTime
                }
            };

            Events.Add(nightEvent);
            await Task.CompletedTask;
        }

        /// <summary>
        /// Traite la phase réveil
        /// </summary>
        private async Task ProcessWakeUpPhase()
        {
            // Phase réveil : Annonce des morts
            TotalTime = 60; // 1 minute en secondes
            TimeRemaining = TotalTime;

            // Résoudre les actions de la nuit
            await ResolveNightActions();

            GameEvent wakeUpEvent = new GameEvent
            {
                GameId = GameId,
                EventType = GameEventType.PhaseChanged,
                Description = "Phase réveil - Annonce des morts de la nuit",
                Data = new Dictionary<string, object>
                {
                    ["phase"] = "WakeUp",
                    ["duration"] = TotalTime
                }
            };

            Events.Add(wakeUpEvent);
            await Task.CompletedTask;
        }

        /// <summary>
        /// Résout les actions de la nuit selon l'ordre de priorité
        /// </summary>
        private async Task ResolveNightActions()
        {
            // Ordonner les actions par priorité
            List<PlayerAction> actions = Players
                .Where(p => p.IsAlive && p.Actions.Any())
                .SelectMany(p => p.Actions.Where(a => a.ActionType == PlayerActionType.UsePower))
                .OrderBy(a => GetActionPriority(a))
                .ToList();

            foreach (PlayerAction action in actions)
            {
                await ProcessAction(action);
            }
        }

        /// <summary>
        /// Obtient la priorité d'une action
        /// </summary>
        private int GetActionPriority(PlayerAction action)
        {
            // Priorités selon la documentation
            return action.ActionType switch
            {
                PlayerActionType.UsePower => 5, // Priorité par défaut
                _ => 10
            };
        }

        /// <summary>
        /// Traite une action
        /// </summary>
        private async Task ProcessAction(PlayerAction action)
        {
            // Logique de traitement des actions
            await Task.CompletedTask;
        }

        /// <summary>
        /// Termine la partie
        /// </summary>
        private async Task EndGame()
        {
            List<Player> alivePlayers = Players.Where(p => p.IsAlive).ToList();
            List<Player> aliveWolves = alivePlayers.Where(p => p.Team == Team.Wolves).ToList();
            List<Player> aliveVillagers = alivePlayers.Where(p => p.Team == Team.Village).ToList();

            string winner;
            if (aliveWolves.Count == 0)
            {
                winner = "Villageois";
            }
            else if (aliveVillagers.Count == 0)
            {
                winner = "Loups";
            }
            else
            {
                winner = "Égalité";
            }

            GameEvent endEvent = new GameEvent
            {
                GameId = GameId,
                EventType = GameEventType.GameEnded,
                Description = $"Partie terminée - {winner} gagnent !",
                Data = new Dictionary<string, object>
                {
                    ["winner"] = winner,
                    ["aliveWolves"] = aliveWolves.Count,
                    ["aliveVillagers"] = aliveVillagers.Count,
                    ["totalTurns"] = NbTurn
                }
            };

            Events.Add(endEvent);
            UpdatedAt = DateTime.UtcNow;
            await Task.CompletedTask;
        }

        /// <summary>
        /// Génère les rôles pour un nombre de joueurs donné
        /// </summary>
        private List<IRole> GenerateRolesForPlayerCount(int playerCount)
        {
            List<IRole> roles = new List<IRole>();
            
            // Pour simplifier, on utilise les rôles de base
            // Dans une version complète, on utiliserait les 29 rôles selon la documentation
            
            // Calculer le nombre de loups (environ 1/4 des joueurs)
            int wolfCount = Math.Max(1, playerCount / 4);
            int villagerCount = playerCount - wolfCount;

            // Ajouter les loups
            for (int i = 0; i < wolfCount; i++)
            {
                roles.Add(new Loup());
            }

            // Ajouter les villageois
            for (int i = 0; i < villagerCount; i++)
            {
                roles.Add(new Villageois());
            }

            // Mélanger les rôles
            return roles.OrderBy(x => Guid.NewGuid()).ToList();
        }

        /// <summary>
        /// Génère une couleur pour un joueur
        /// </summary>
        private string GeneratePlayerColor(int index)
        {
            string[] colors = new[]
            {
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
                "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
            };
            
            return colors[index % colors.Length];
        }

        /// <summary>
        /// Change de phase
        /// </summary>
        public void ChangePhase(GamePhase newPhase)
        {
            CurrentPhase = newPhase;
            UpdatedAt = DateTime.UtcNow;

            GameEvent phaseChangeEvent = new GameEvent
            {
                GameId = GameId,
                EventType = GameEventType.PhaseChanged,
                Description = $"Phase changée vers {newPhase}",
                Data = new Dictionary<string, object>
                {
                    ["newPhase"] = newPhase.ToString(),
                    ["previousPhase"] = CurrentPhase.ToString()
                }
            };

            Events.Add(phaseChangeEvent);
        }

        /// <summary>
        /// Ajoute un joueur à la partie
        /// </summary>
        public void AddPlayer(Player player)
        {
            player.GameId = GameId;
            Players.Add(player);
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Retire un joueur de la partie
        /// </summary>
        public void RemovePlayer(string playerId)
        {
            Player player = Players.FirstOrDefault(p => p.Id == playerId);
            if (player != null)
            {
                Players.Remove(player);
                UpdatedAt = DateTime.UtcNow;
            }
        }

        /// <summary>
        /// Obtient un joueur par son ID
        /// </summary>
        public Player? GetPlayer(string playerId)
        {
            return Players.FirstOrDefault(p => p.Id == playerId);
        }

        /// <summary>
        /// Obtient les joueurs vivants
        /// </summary>
        public List<Player> GetAlivePlayers()
        {
            return Players.Where(p => p.IsAlive).ToList();
        }

        /// <summary>
        /// Obtient les joueurs d'une équipe
        /// </summary>
        public List<Player> GetPlayersByTeam(Team team)
        {
            return Players.Where(p => p.Team == team).ToList();
        }
    }
}
