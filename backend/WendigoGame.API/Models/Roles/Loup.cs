

namespace WendigoGame.API.Models.Roles
{
    /// <summary>
    /// Rôle Loup selon le diagramme UML
    /// actionPoint = 00 selon le diagramme
    /// </summary>
    public class Loup : BaseRole
    {
        public override Alignement Alignement => Alignement.Evil;
        public override int ActionPoint => 0; // 00 selon le diagramme UML
        public override string Name => "Loup";
        public override string Description => "Loup-garou classique qui vote avec les autres loups pour tuer un joueur la nuit.";
        public override Team Team => Team.Wolves;
        public override string Power => "Vote avec les autres loups pour tuer un joueur la nuit";
        public override bool IsActive => true;
        public override GamePhase ActionPhase => GamePhase.Night;

        /// <summary>
        /// Indique si le loup a voté pour une victime cette nuit
        /// </summary>
        public bool HasVotedThisNight { get; set; } = false;

        /// <summary>
        /// ID de la victime votée cette nuit
        /// </summary>
        public string? VotedVictimId { get; set; }

        public override int ExecutionPriority => 4; // Priorité 4 selon la documentation

        protected override async Task<GameActionResult> ExecutePowerAsync(GameActionContext context)
        {
            // Le pouvoir du loup est de voter pour une victime
            if (string.IsNullOrEmpty(context.TargetPlayerId))
            {
                return GameActionResult.FailureResult("Le loup doit cibler un joueur");
            }

            // Vérifier que le loup n'a pas déjà voté cette nuit
            if (HasVotedThisNight)
            {
                return GameActionResult.FailureResult("Le loup a déjà voté cette nuit");
            }

            // Enregistrer le vote
            HasVotedThisNight = true;
            VotedVictimId = context.TargetPlayerId;

            GameActionResult result = GameActionResult.SuccessResult($"Le loup a voté pour {context.TargetPlayerId}");
            result.ResultData["votedVictimId"] = context.TargetPlayerId;
            result.ResultData["hasVotedThisNight"] = true;

            // Créer un événement de vote
            GameEvent voteEvent = new GameEvent
            {
                GameId = context.GameId,
                EventType = GameEventType.PlayerAction,
                PlayerId = context.PlayerId,
                TargetPlayerId = context.TargetPlayerId,
                Description = $"Le loup a voté pour tuer {context.TargetPlayerId}",
                Data = new Dictionary<string, object>
                {
                    ["actionType"] = "WolfVote",
                    ["victimId"] = context.TargetPlayerId
                }
            };

            result.TriggeredEvents.Add(voteEvent);

            return await Task.FromResult(result);
        }

        public override bool CanUsePower(GameActionContext context)
        {
            // Le loup ne peut voter que la nuit
            if (context.CurrentPhase != GamePhase.Night)
                return false;

            // Le loup ne peut voter qu'une fois par nuit
            if (HasVotedThisNight)
                return false;

            return base.CanUsePower(context);
        }

        /// <summary>
        /// Remet à zéro le vote pour la prochaine nuit
        /// </summary>
        public void ResetNightVote()
        {
            HasVotedThisNight = false;
            VotedVictimId = null;
        }

        /// <summary>
        /// Vérifie si le loup peut être utilisé dans une partie
        /// </summary>
        public override bool CanBeUsedInGame(int playerCount)
        {
            // Les loups sont nécessaires dans toutes les parties
            return base.CanBeUsedInGame(playerCount);
        }
    }
}
