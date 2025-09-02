

namespace WendigoGame.API.Models.Roles
{
    /// <summary>
    /// Classe de base pour tous les rôles
    /// </summary>
    public abstract class BaseRole : IRole
    {
        public abstract Alignement Alignement { get; }
        public abstract int ActionPoint { get; }
        public abstract string Name { get; }
        public abstract string Description { get; }
        public abstract Team Team { get; }
        public abstract string Power { get; }
        public abstract bool IsActive { get; }
        public abstract GamePhase ActionPhase { get; }

        /// <summary>
        /// Indique si le pouvoir a été utilisé
        /// </summary>
        public bool PowerUsed { get; set; } = false;

        /// <summary>
        /// Nombre d'utilisations restantes du pouvoir
        /// </summary>
        public int PowerUsesRemaining { get; set; } = 1;

        /// <summary>
        /// Cooldown du pouvoir en secondes
        /// </summary>
        public int PowerCooldown { get; set; } = 0;

        /// <summary>
        /// Dernière utilisation du pouvoir
        /// </summary>
        public DateTime? LastPowerUsed { get; set; }

        public virtual async Task<GameActionResult> ActionAsync(GameActionContext context)
        {
            if (!CanUsePower(context))
            {
                return GameActionResult.FailureResult("Le pouvoir ne peut pas être utilisé dans ce contexte");
            }

            GameActionResult result = await ExecutePowerAsync(context);
            
            if (result.Success)
            {
                PowerUsed = true;
                PowerUsesRemaining--;
                LastPowerUsed = DateTime.UtcNow;
            }

            return result;
        }

        public virtual bool CanUsePower(GameActionContext context)
        {
            // Vérifications de base
            if (!IsActive) return false;
            if (PowerUsesRemaining <= 0) return false;
            if (context.CurrentPhase != ActionPhase) return false;

            // Vérification du cooldown
            if (LastPowerUsed.HasValue && PowerCooldown > 0)
            {
                TimeSpan timeSinceLastUse = DateTime.UtcNow - LastPowerUsed.Value;
                if (timeSinceLastUse.TotalSeconds < PowerCooldown)
                {
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Méthode abstraite pour l'exécution du pouvoir
        /// </summary>
        /// <param name="context">Contexte de l'action</param>
        /// <returns>Résultat de l'action</returns>
        protected abstract Task<GameActionResult> ExecutePowerAsync(GameActionContext context);

        /// <summary>
        /// Vérifie si le rôle peut être utilisé dans une partie
        /// </summary>
        /// <param name="playerCount">Nombre de joueurs</param>
        /// <returns>True si le rôle peut être utilisé</returns>
        public virtual bool CanBeUsedInGame(int playerCount)
        {
            return playerCount >= 8 && playerCount <= 29;
        }

        /// <summary>
        /// Priorité d'exécution du pouvoir (pour l'ordre de résolution)
        /// </summary>
        public virtual int ExecutionPriority => 5;

        /// <summary>
        /// Indique si le rôle est un rôle de loup
        /// </summary>
        public virtual bool IsWolfRole => Team == Team.Wolves;

        /// <summary>
        /// Indique si le rôle est un rôle de villageois
        /// </summary>
        public virtual bool IsVillagerRole => Team == Team.Village;
    }
}
