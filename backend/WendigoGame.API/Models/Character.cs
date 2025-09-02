

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Classe parente pour les personnages du jeu
    /// Basée sur le diagramme UML fourni
    /// </summary>
    public abstract class Character
    {
        /// <summary>
        /// ID unique du personnage
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Rôle du personnage (composition avec IRole selon le diagramme UML)
        /// </summary>
        public IRole Role { get; set; } = null!;

        /// <summary>
        /// Indique si le personnage est en vie
        /// </summary>
        public bool IsAlive { get; set; } = true;

        /// <summary>
        /// Indique si le personnage est prêt
        /// </summary>
        public bool IsReady { get; set; } = false;

        /// <summary>
        /// Numéro de chaise sélectionnée
        /// </summary>
        public int? SelectedChair { get; set; }

        /// <summary>
        /// Équipe du personnage
        /// </summary>
        public Team Team => Role.Team;

        /// <summary>
        /// Couleur du personnage
        /// </summary>
        public string Color { get; set; } = string.Empty;

        /// <summary>
        /// Date de création du personnage
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Date de dernière mise à jour
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Méthode ToString() selon le diagramme UML
        /// </summary>
        /// <returns>Représentation string du personnage</returns>
        public override string ToString()
        {
            return $"{GetType().Name} - {Role.Name} (Team: {Team}, Alive: {IsAlive})";
        }

        /// <summary>
        /// Méthode Playing() selon le diagramme UML
        /// </summary>
        /// <returns>True si le personnage peut jouer</returns>
        public virtual bool Playing()
        {
            return IsAlive && IsReady;
        }

        /// <summary>
        /// Méthode GetRole() selon le diagramme UML
        /// </summary>
        /// <returns>Le rôle du personnage</returns>
        public IRole GetRole()
        {
            return Role;
        }

        /// <summary>
        /// Vérifie si le personnage peut effectuer une action
        /// </summary>
        /// <param name="context">Contexte de l'action</param>
        /// <returns>True si l'action est possible</returns>
        public virtual bool CanPerformAction(GameActionContext context)
        {
            return IsAlive && Role.CanUsePower(context);
        }

        /// <summary>
        /// Effectue une action avec le rôle du personnage
        /// </summary>
        /// <param name="context">Contexte de l'action</param>
        /// <returns>Résultat de l'action</returns>
        public virtual async Task<GameActionResult> PerformActionAsync(GameActionContext context)
        {
            if (!CanPerformAction(context))
            {
                return GameActionResult.FailureResult("Le personnage ne peut pas effectuer cette action");
            }

            context.PlayerId = Id;
            GameActionResult result = await Role.ActionAsync(context);
            
            UpdatedAt = DateTime.UtcNow;
            return result;
        }
    }
}
