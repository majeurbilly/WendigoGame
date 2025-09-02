

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Classe Display selon le diagramme UML
    /// Contient nbTour = 0 et les méthodes d'affichage
    /// </summary>
    public class Display
    {
        /// <summary>
        /// Nombre de tours selon le diagramme UML
        /// </summary>
        public int NbTour { get; set; } = 0;

        /// <summary>
        /// ID de la partie
        /// </summary>
        public string GameId { get; set; } = string.Empty;

        /// <summary>
        /// Messages d'affichage
        /// </summary>
        public List<DisplayMessage> Messages { get; set; } = new();

        /// <summary>
        /// Méthode DisplayNbTour selon le diagramme UML
        /// </summary>
        public void DisplayNbTour()
        {
            string message = $"Tour {NbTour}";
            AddMessage(message, DisplayMessageType.Info);
        }

        /// <summary>
        /// Méthode Ending selon le diagramme UML
        /// </summary>
        public void Ending()
        {
            string message = "Fin de partie";
            AddMessage(message, DisplayMessageType.GameEnd);
        }

        /// <summary>
        /// Méthode Display selon le diagramme UML
        /// </summary>
        public void DisplayGeneral()
        {
            string message = "Affichage général";
            AddMessage(message, DisplayMessageType.Info);
        }

        /// <summary>
        /// Méthode Display4 selon le diagramme UML
        /// </summary>
        public void Display4()
        {
            string message = "Affichage spécifique 4";
            AddMessage(message, DisplayMessageType.Info);
        }

        /// <summary>
        /// Affiche le statut de la partie
        /// </summary>
        public void DisplayGameStatus(GameStatus status)
        {
            string message = status switch
            {
                GameStatus.Waiting => "En attente de joueurs",
                GameStatus.Playing => "Partie en cours",
                GameStatus.Finished => "Partie terminée",
                _ => "Statut inconnu"
            };
            
            AddMessage(message, DisplayMessageType.Status);
        }

        /// <summary>
        /// Affiche la phase actuelle
        /// </summary>
        public void DisplayCurrentPhase(GamePhase phase, int timeRemaining)
        {
            string phaseName = phase switch
            {
                GamePhase.Day => "Jour",
                GamePhase.Evening => "Soir (Conseil)",
                GamePhase.Night => "Nuit",
                GamePhase.WakeUp => "Réveil",
                _ => "Phase inconnue"
            };

            string message = $"Phase {phaseName} - {timeRemaining}s restantes";
            AddMessage(message, DisplayMessageType.Phase);
        }

        /// <summary>
        /// Affiche les joueurs vivants
        /// </summary>
        public void DisplayAlivePlayers(List<Player> players)
        {
            int aliveCount = players.Count(p => p.IsAlive);
            string message = $"Joueurs vivants : {aliveCount}/{players.Count}";
            AddMessage(message, DisplayMessageType.PlayerCount);

            foreach (Player player in players.Where(p => p.IsAlive))
            {
                string playerMessage = $"- {player.Name} ({player.Role.Name})";
                AddMessage(playerMessage, DisplayMessageType.PlayerInfo);
            }
        }

        /// <summary>
        /// Affiche les résultats d'un vote
        /// </summary>
        public void DisplayVoteResults(List<Vote> votes)
        {
            List<IGrouping<string, Vote>> voteGroups = votes.GroupBy(v => v.TargetPlayerId)
                                 .OrderByDescending(g => g.Count())
                                 .ToList();

            AddMessage("Résultats des votes :", DisplayMessageType.VoteResults);

            foreach (IGrouping<string, Vote> group in voteGroups)
            {
                string message = $"- {group.Key} : {group.Count()} vote(s)";
                AddMessage(message, DisplayMessageType.VoteCount);
            }
        }

        /// <summary>
        /// Affiche les actions de la nuit
        /// </summary>
        public void DisplayNightActions(List<PlayerAction> actions)
        {
            AddMessage("Actions de la nuit :", DisplayMessageType.NightActions);

            foreach (PlayerAction action in actions)
            {
                string message = $"- {action.PlayerId} a utilisé {action.ActionType}";
                if (!string.IsNullOrEmpty(action.TargetPlayerId))
                {
                    message += $" sur {action.TargetPlayerId}";
                }
                AddMessage(message, DisplayMessageType.Action);
            }
        }

        /// <summary>
        /// Affiche les morts de la nuit
        /// </summary>
        public void DisplayNightDeaths(List<Player> deadPlayers)
        {
            if (deadPlayers.Any())
            {
                AddMessage("Morts de la nuit :", DisplayMessageType.Deaths);
                foreach (Player player in deadPlayers)
                {
                    string message = $"- {player.Name} ({player.Role.Name})";
                    AddMessage(message, DisplayMessageType.Death);
                }
            }
            else
            {
                AddMessage("Personne n'est mort cette nuit", DisplayMessageType.NoDeaths);
            }
        }

        /// <summary>
        /// Affiche le gagnant de la partie
        /// </summary>
        public void DisplayWinner(string winner, List<Player> alivePlayers)
        {
            string message = $"🎉 {winner} gagnent ! 🎉";
            AddMessage(message, DisplayMessageType.Winner);

            int aliveWolves = alivePlayers.Count(p => p.Team == Team.Wolves);
            int aliveVillagers = alivePlayers.Count(p => p.Team == Team.Village);

            AddMessage($"Loups survivants : {aliveWolves}", DisplayMessageType.WinnerStats);
            AddMessage($"Villageois survivants : {aliveVillagers}", DisplayMessageType.WinnerStats);
        }

        /// <summary>
        /// Affiche un message système
        /// </summary>
        public void DisplaySystemMessage(string message)
        {
            AddMessage(message, DisplayMessageType.System);
        }

        /// <summary>
        /// Affiche un message d'erreur
        /// </summary>
        public void DisplayError(string error)
        {
            AddMessage($"❌ Erreur : {error}", DisplayMessageType.Error);
        }

        /// <summary>
        /// Affiche un message de succès
        /// </summary>
        public void DisplaySuccess(string message)
        {
            AddMessage($"✅ {message}", DisplayMessageType.Success);
        }

        /// <summary>
        /// Ajoute un message d'affichage
        /// </summary>
        private void AddMessage(string content, DisplayMessageType type)
        {
            DisplayMessage message = new DisplayMessage
            {
                Id = Guid.NewGuid().ToString(),
                Content = content,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            Messages.Add(message);
        }

        /// <summary>
        /// Obtient les messages récents
        /// </summary>
        public List<DisplayMessage> GetRecentMessages(int count = 10)
        {
            return Messages
                .OrderByDescending(m => m.Timestamp)
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// Obtient les messages par type
        /// </summary>
        public List<DisplayMessage> GetMessagesByType(DisplayMessageType type)
        {
            return Messages
                .Where(m => m.Type == type)
                .OrderByDescending(m => m.Timestamp)
                .ToList();
        }

        /// <summary>
        /// Efface tous les messages
        /// </summary>
        public void ClearMessages()
        {
            Messages.Clear();
        }

        /// <summary>
        /// Efface les messages anciens
        /// </summary>
        public void ClearOldMessages(TimeSpan olderThan)
        {
            DateTime cutoff = DateTime.UtcNow - olderThan;
            Messages.RemoveAll(m => m.Timestamp < cutoff);
        }
    }

    /// <summary>
    /// Message d'affichage
    /// </summary>
    public class DisplayMessage
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Content { get; set; } = string.Empty;
        public DisplayMessageType Type { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Type de message d'affichage
    /// </summary>
    public enum DisplayMessageType
    {
        Info,
        Status,
        Phase,
        PlayerCount,
        PlayerInfo,
        VoteResults,
        VoteCount,
        NightActions,
        Action,
        Deaths,
        Death,
        NoDeaths,
        Winner,
        WinnerStats,
        System,
        Error,
        Success,
        GameEnd
    }
}
