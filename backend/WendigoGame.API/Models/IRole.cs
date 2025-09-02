

namespace WendigoGame.API.Models
{
    /// <summary>
    /// Interface pour les rôles du jeu Wendigo
    /// Basée sur le diagramme UML fourni
    /// </summary>
    public interface IRole
    {
        /// <summary>
        /// Alignement du rôle (Good/Evil)
        /// </summary>
        Alignement Alignement { get; }

        /// <summary>
        /// Points d'action du rôle
        /// </summary>
        int ActionPoint { get; }

        /// <summary>
        /// Nom du rôle
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Description du rôle
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Équipe du rôle (Village/Wolves)
        /// </summary>
        Team Team { get; }

        /// <summary>
        /// Pouvoir principal du rôle
        /// </summary>
        string Power { get; }

        /// <summary>
        /// Indique si le rôle est actif
        /// </summary>
        bool IsActive { get; }

        /// <summary>
        /// Phase d'action du rôle
        /// </summary>
        GamePhase ActionPhase { get; }

        /// <summary>
        /// Méthode d'action du rôle 
        /// </summary>
        /// <param name="context">Contexte de l'action</param>
        /// <returns>Résultat de l'action</returns>
        Task<GameActionResult> ActionAsync(GameActionContext context);

        /// <summary>
        /// Vérifie si le rôle peut utiliser son pouvoir
        /// </summary>
        /// <param name="context">Contexte de la vérification</param>
        /// <returns>True si le pouvoir peut être utilisé</returns>
        bool CanUsePower(GameActionContext context);
    }
}
