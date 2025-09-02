

namespace WendigoGame.API.Models.Roles
{
    /// <summary>
    /// Rôle Villageois selon le diagramme UML
    /// actionPoint = 99 selon le diagramme
    /// </summary>
    public class Villageois : BaseRole
    {
        public override Alignement Alignement => Alignement.Good;
        public override int ActionPoint => 99; // 99 selon le diagramme UML
        public override string Name => "Villageois";
        public override string Description => "Villageois classique sans pouvoir spécial, mais avec une grande capacité d'action.";
        public override Team Team => Team.Village;
        public override string Power => "Aucun pouvoir spécial, mais peut voter et participer aux discussions";
        public override bool IsActive => true;
        public override GamePhase ActionPhase => GamePhase.Day; // Peut agir le jour

        public override int ExecutionPriority => 6; // Priorité 6 selon la documentation

        protected override async Task<GameActionResult> ExecutePowerAsync(GameActionContext context)
        {
            // Le villageois n'a pas de pouvoir spécial
            // Il peut seulement voter et participer aux discussions
            
            GameActionResult result = GameActionResult.SuccessResult("Le villageois n'a pas de pouvoir spécial à utiliser");
            result.ResultData["hasNoSpecialPower"] = true;

            // Créer un événement d'action
            GameEvent actionEvent = new GameEvent
            {
                GameId = context.GameId,
                EventType = GameEventType.PlayerAction,
                PlayerId = context.PlayerId,
                Description = "Le villageois a tenté d'utiliser un pouvoir (aucun pouvoir spécial)",
                Data = new Dictionary<string, object>
                {
                    ["actionType"] = "VillagerAction",
                    ["hasNoPower"] = true
                }
            };

            result.TriggeredEvents.Add(actionEvent);

            return await Task.FromResult(result);
        }

        public override bool CanUsePower(GameActionContext context)
        {
            // Le villageois peut "utiliser son pouvoir" (qui n'en est pas un) le jour
            if (context.CurrentPhase != GamePhase.Day)
                return false;

            return base.CanUsePower(context);
        }

        /// <summary>
        /// Vérifie si le villageois peut être utilisé dans une partie
        /// </summary>
        public override bool CanBeUsedInGame(int playerCount)
        {
            // Les villageois sont nécessaires dans toutes les parties
            return base.CanBeUsedInGame(playerCount);
        }

        /// <summary>
        /// Le villageois peut voter pour des accusations
        /// </summary>
        public bool CanVoteForAccusation(GamePhase phase)
        {
            return phase == GamePhase.Evening || phase == GamePhase.Day;
        }

        /// <summary>
        /// Le villageois peut participer aux discussions
        /// </summary>
        public bool CanParticipateInDiscussions(GamePhase phase)
        {
            return phase == GamePhase.Day || phase == GamePhase.Evening;
        }
    }
}
