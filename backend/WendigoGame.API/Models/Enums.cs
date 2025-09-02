namespace WendigoGame.API.Models
{
    /// <summary>
    /// Énumération des alignements des rôles (Good/Evil)
    /// </summary>
    public enum Alignement
    {
        Good,
        Evil
    }

    /// <summary>
    /// Énumération des équipes du jeu
    /// </summary>
    public enum Team
    {
        Village,
        Wolves
    }

    /// <summary>
    /// Énumération des phases de jeu
    /// </summary>
    public enum GamePhase
    {
        Day,        // Phase jour (10 minutes)
        Evening,    // Phase soir (Conseil du village)
        Night,      // Phase nuit (Actions des rôles)
        WakeUp      // Phase réveil (Annonce des morts)
    }

    /// <summary>
    /// Énumération du statut de la partie
    /// </summary>
    public enum GameStatus
    {
        Waiting,    // En attente de joueurs
        Playing,    // En cours
        Finished    // Terminée
    }

    /// <summary>
    /// Énumération du statut du lobby
    /// </summary>
    public enum LobbyStatus
    {
        Open,       // Ouvert aux nouveaux joueurs
        Full,       // Complet
        Starting,   // En cours de démarrage
        Closed      // Fermé
    }

    /// <summary>
    /// Énumération des types d'actions des joueurs
    /// </summary>
    public enum PlayerActionType
    {
        SelectChair,    // Sélection de chaise
        SubmitVote,     // Vote d'accusation
        UsePower,       // Utilisation d'un pouvoir
        SendMessage,    // Envoi de message
        Defend          // Défense lors du conseil
    }

    /// <summary>
    /// Énumération des types d'événements de jeu
    /// </summary>
    public enum GameEventType
    {
        PhaseChanged,       // Changement de phase
        PlayerAction,       // Action d'un joueur
        VoteSubmitted,      // Vote soumis
        GameEnded,          // Fin de partie
        PlayerDied,         // Mort d'un joueur
        ChairSelected,      // Chaise sélectionnée
        PowerUsed,          // Pouvoir utilisé
        MessageSent         // Message envoyé
    }

    /// <summary>
    /// Énumération des types de votes
    /// </summary>
    public enum VoteType
    {
        Accusation,         // Vote d'accusation (jour)
        Condemnation,       // Vote de condamnation (soir)
        WolfVote            // Vote des loups (nuit)
    }

    /// <summary>
    /// Énumération des types de messages
    /// </summary>
    public enum MessageType
    {
        Chat,               // Message de chat normal
        System,             // Message système
        Ghost,              // Message de fantôme
        WolfChat,           // Chat des loups
        MediumChat          // Chat du médium
    }
}
