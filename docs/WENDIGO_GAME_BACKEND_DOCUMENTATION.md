# 🐺 WendigoGame Backend - Documentation Complète

## 📋 Table des Matières

1. [Vue d'ensemble du Projet](#vue-densemble-du-projet)
2. [Architecture du Backend](#architecture-du-backend)
3. [Structure des Modèles](#structure-des-modèles)
4. [Services et Logique Métier](#services-et-logique-métier)
5. [API Controllers](#api-controllers)
6. [SignalR Hubs](#signalr-hubs)
7. [Base de Données](#base-de-données)
8. [Tests et TestRunner](#tests-et-testrunner)
9. [Configuration et Déploiement](#configuration-et-déploiement)
10. [Guide de Développement](#guide-de-développement)

---

## 🎯 Vue d'ensemble du Projet

**WendigoGame** est un jeu de loup-garou hybride présentiel-numérique où tous les joueurs ont des pouvoirs uniques. Le backend est développé en **.NET Core 8.0** avec une architecture moderne et scalable.

### 🏗️ Technologies Utilisées

- **Framework** : .NET Core 8.0
- **API** : ASP.NET Core Web API
- **Communication Temps Réel** : SignalR
- **Base de Données** : SQL Server avec Entity Framework Core
- **Documentation API** : Swagger/OpenAPI
- **Authentification** : JWT (JwtBearer)
- **Tests** : xUnit + Moq
- **Logging** : ILogger intégré

### 🎮 Concept du Jeu

- **8 à 29 joueurs** dans la même pièce physique
- **29 rôles uniques** avec des pouvoirs distincts
- **Phases de jeu** : Jour, Soir (Conseil), Nuit, Réveil
- **Système de vibration séquentielle** pour le réveil nocturne
- **Système de chaises** pour la validation physique
- **Vote unanime des loups** pour les décisions nocturnes
- **Chat des fantômes** pour les joueurs morts
- **Système de bûcher dynamique**

---

## 🏛️ Architecture du Backend

### 📁 Structure des Dossiers

```
backend/
├── WendigoGame.API/                    # API principale
│   ├── Controllers/                    # Contrôleurs API REST
│   ├── Services/                       # Services métier
│   ├── Models/                         # Modèles de données
│   │   ├── Roles/                      # Rôles du jeu
│   │   └── GameEntities.cs            # Entités EF Core
│   ├── Data/                           # Couche de données
│   ├── Hubs/                           # Hubs SignalR
│   ├── Program.cs                      # Point d'entrée
│   └── appsettings.json               # Configuration
├── WendigoGame.TestRunner/             # Tests avancés
│   ├── GameSimulationTest.cs          # Simulation complète
│   └── TestRunner.cs                  # Lanceur de tests
└── WendigoGame.API.Tests/              # Tests unitaires
    ├── GameSimulationTest.cs          # Tests de simulation
    ├── ManualTest.cs                   # Tests manuels
    └── SimpleGameTest.cs               # Tests simples
```

### 🔄 Flux de Données

```
Client (Flutter) → SignalR Hub → Service → Modèle → Base de Données
                ↓
            API REST → Controller → Service → Modèle → Base de Données
```

---

## 🎭 Structure des Modèles

### 🎯 Hiérarchie des Classes

#### **Character (Classe Abstraite)**
```csharp
public abstract class Character
{
    public string Id { get; set; }
    public IRole Role { get; set; }
    public bool IsAlive { get; set; }
    public bool IsReady { get; set; }
    public int? SelectedChair { get; set; }
    public Team Team => Role.Team;
    public string Color { get; set; }
    
    public virtual bool Playing() => IsAlive && IsReady;
    public virtual async Task<GameActionResult> PerformActionAsync(GameActionContext context);
}
```

#### **Player (Hérite de Character)**
```csharp
public class Player : Character
{
    public string Name { get; set; }
    public string UserId { get; set; }
    public string GameId { get; set; }
    public string? ConnectionId { get; set; }
    public bool IsConnected { get; set; }
    
    // Collections
    public List<Vote> Votes { get; set; }
    public List<PlayerAction> Actions { get; set; }
    public List<GameMessage> Messages { get; set; }
    public List<PlayerNote> Notes { get; set; }
    
    // Méthodes métier
    public bool CanVote(GamePhase phase);
    public bool CanSelectChair(GamePhase phase, int timeRemaining);
    public bool CanUsePower(GamePhase phase);
}
```

#### **IRole (Interface)**
```csharp
public interface IRole
{
    Alignement Alignement { get; }
    int ActionPoint { get; }
    string Name { get; }
    string Description { get; }
    Team Team { get; }
    string Power { get; }
    bool IsActive { get; }
    GamePhase ActionPhase { get; }
    
    Task<GameActionResult> ActionAsync(GameActionContext context);
    bool CanUsePower(GameActionContext context);
}
```

#### **BaseRole (Classe Abstraite)**
```csharp
public abstract class BaseRole : IRole
{
    public bool PowerUsed { get; set; }
    public int PowerUsesRemaining { get; set; }
    public int PowerCooldown { get; set; }
    public DateTime? LastPowerUsed { get; set; }
    
    protected abstract Task<GameActionResult> ExecutePowerAsync(GameActionContext context);
    public virtual int ExecutionPriority => 5;
    public virtual bool IsWolfRole => Team == Team.Wolves;
    public virtual bool IsVillagerRole => Team == Team.Village;
}
```

#### **Rôles Concrets**

##### **Loup**
```csharp
public class Loup : BaseRole
{
    public override Alignement Alignement => Alignement.Evil;
    public override int ActionPoint => 0; // 00 selon UML
    public override Team Team => Team.Wolves;
    public override GamePhase ActionPhase => GamePhase.Night;
    public override int ExecutionPriority => 4;
    
    public bool HasVotedThisNight { get; set; }
    public string? VotedVictimId { get; set; }
    
    // Vote nocturne pour tuer un joueur
    protected override async Task<GameActionResult> ExecutePowerAsync(GameActionContext context);
}
```

##### **Villageois**
```csharp
public class Villageois : BaseRole
{
    public override Alignement Alignement => Alignement.Good;
    public override int ActionPoint => 99; // 99 selon UML
    public override Team Team => Team.Village;
    public override GamePhase ActionPhase => GamePhase.Day;
    public override int ExecutionPriority => 6;
    
    // Aucun pouvoir spécial, mais peut voter et discuter
    protected override async Task<GameActionResult> ExecutePowerAsync(GameActionContext context);
}
```

### 🎮 Modèles de Jeu

#### **Game (Entité Base de Données)**
```csharp
public class Game
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string LobbyId { get; set; }
    public List<Player> Players { get; set; }
    public GameStatus Status { get; set; }
    public GamePhase CurrentPhase { get; set; }
    public int NbTurn { get; set; }
    public DateTime PhaseStartTime { get; set; }
    public TimeSpan PhaseDuration { get; set; }
    public List<GameEvent> GameEvents { get; set; }
    public List<GameMessage> GameMessages { get; set; }
    public GameSettings Settings { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? WinnerTeam { get; set; }
}
```

#### **GameManager (Logique Métier)**
```csharp
public class GameManager
{
    public string GameId { get; set; }
    public GameStatus Status { get; set; }
    public GamePhase CurrentPhase { get; set; }
    public int NbTurn { get; set; }
    public int TotalTime { get; set; }
    public int TimeRemaining { get; set; }
    public List<Player> Players { get; set; }
    public List<GameEvent> Events { get; set; }
    public List<Vote> Votes { get; set; }
    public List<GameMessage> Messages { get; set; }
    public Display Display { get; set; }
    public GameSettings Settings { get; set; }
    
    // Méthodes métier
    public async Task<bool> StartGameAsync();
    public async Task<bool> NextPhaseAsync();
    public async Task<bool> ProcessVotesAsync();
    public async Task<bool> ProcessNightActionsAsync();
    public async Task<bool> CheckGameEndAsync();
}
```

#### **Lobby**
```csharp
public class Lobby
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int MinPlayers { get; set; } = 8;
    public int MaxPlayers { get; set; } = 29;
    public List<LobbyPlayer> Players { get; set; }
    public LobbyStatus Status { get; set; }
    public string CreatorId { get; set; }
    public string? Password { get; set; }
    public List<LobbyMessage> Messages { get; set; }
    
    // Propriétés calculées
    public bool IsFull => Players.Count >= MaxPlayers;
    public bool CanStart => Players.Count >= MinPlayers && Players.All(p => p.IsReady);
    public int ReadyPlayersCount => Players.Count(p => p.IsReady);
    
    // Méthodes métier
    public bool AddPlayer(LobbyPlayer player);
    public bool RemovePlayer(string userId);
    public bool UpdatePlayerReady(string userId, bool isReady);
    public bool StartGame(string gameId);
}
```

### 📊 Enums et Types

#### **GameStatus**
```csharp
public enum GameStatus
{
    Waiting,    // En attente de joueurs
    Playing,    // Partie en cours
    Finished    // Partie terminée
}
```

#### **GamePhase**
```csharp
public enum GamePhase
{
    Day,        // Phase de jour (discussions, sélection de chaises)
    Evening,    // Phase de soir (conseil, votes d'accusation)
    Night,      // Phase de nuit (actions des rôles)
    WakeUp      // Phase de réveil (résolution des actions)
}
```

#### **Team**
```csharp
public enum Team
{
    Village,    // Villageois et rôles de défense
    Wolves      // Loups et rôles maléfiques
}
```

#### **Alignement**
```csharp
public enum Alignement
{
    Good,       // Rôles bienveillants
    Evil,       // Rôles maléfiques
    Neutral     // Rôles neutres
}
```

---

## ⚙️ Services et Logique Métier

### 🔧 GameService

Le service principal qui gère toute la logique du jeu.

#### **Méthodes Principales**
```csharp
public class GameService : IGameService
{
    // Création et gestion des parties
    public async Task<GameManager> CreateGameAsync(string lobbyId);
    public async Task<GameManager?> GetGameAsync(string gameId);
    public async Task<List<GameManager>> GetActiveGamesAsync();
    
    // Gestion des joueurs
    public async Task<bool> AddPlayerToGameAsync(string gameId, string userId, string playerName);
    public async Task<bool> RemovePlayerFromGameAsync(string gameId, string userId);
    public async Task<bool> UpdatePlayerReadyAsync(string gameId, string userId, bool isReady);
    
    // Actions de jeu
    public async Task<GameActionResult> PerformPlayerActionAsync(string gameId, string playerId, GameActionContext context);
    public async Task<bool> ProcessVoteAsync(string gameId, string voterId, string targetId, VoteType voteType);
    public async Task<bool> SelectChairAsync(string gameId, string playerId, int chairNumber);
    
    // Gestion des phases
    public async Task<bool> StartGameAsync(string gameId);
    public async Task<bool> NextPhaseAsync(string gameId);
    public async Task<bool> EndGameAsync(string gameId);
}
```

#### **Logique de Création de Partie**
```csharp
public async Task<GameManager> CreateGameAsync(string lobbyId)
{
    // 1. Récupérer le lobby
    Lobby lobby = await _context.Lobbies
        .Include(l => l.Players)
        .FirstOrDefaultAsync(l => l.Id == lobbyId);
    
    // 2. Créer l'entité Game
    Game game = new Game
    {
        Id = Guid.NewGuid().ToString(),
        Name = $"Partie de {lobby.Name}",
        LobbyId = lobby.Id,
        Status = GameStatus.Waiting,
        CurrentPhase = GamePhase.Day,
        PhaseDuration = TimeSpan.FromMinutes(10),
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };
    
    // 3. Attribuer les rôles aux joueurs
    List<IRole> shuffledRoles = GetShuffledRoles(lobby.Players.Count);
    
    foreach (LobbyPlayer lobbyPlayer in lobby.Players)
    {
        Player player = new Player
        {
            Id = Guid.NewGuid().ToString(),
            Name = lobbyPlayer.Name,
            UserId = lobbyPlayer.UserId,
            Role = shuffledRoles[i],
            IsAlive = true,
            IsReady = true,
            GameId = game.Id,
            Color = GeneratePlayerColor(i)
        };
        
        game.Players.Add(player);
    }
    
    // 4. Sauvegarder en base
    _context.Games.Add(game);
    await _context.SaveChangesAsync();
    
    // 5. Convertir en GameManager et retourner
    return ConvertToGameManager(game);
}
```

### 🏠 LobbyService

Service de gestion des lobbies de préparation.

#### **Méthodes Principales**
```csharp
public class LobbyService : ILobbyService
{
    // Gestion des lobbies
    public async Task<Lobby> CreateLobbyAsync(string name, string description, string creatorId, string? password);
    public async Task<Lobby?> GetLobbyAsync(string lobbyId);
    public async Task<List<Lobby>> GetOpenLobbiesAsync();
    
    // Gestion des joueurs
    public async Task<bool> JoinLobbyAsync(string lobbyId, string userId, string playerName, string? password);
    public async Task<bool> LeaveLobbyAsync(string lobbyId, string userId);
    public async Task<bool> UpdatePlayerReadyAsync(string lobbyId, string userId, bool isReady);
    
    // Messages
    public async Task<bool> SendMessageAsync(string lobbyId, string userId, string content);
    public async Task<List<LobbyMessage>> GetLobbyMessagesAsync(string lobbyId, int count = 50);
}
```

---

## 🌐 API Controllers

### 🎮 GameController

Gère toutes les opérations liées au jeu via des endpoints REST.

#### **Endpoints Principaux**
```csharp
[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    // Gestion des parties
    [HttpPost("create")]
    public async Task<ActionResult<GameManager>> CreateGame([FromBody] CreateGameRequest request);
    
    [HttpGet("{gameId}")]
    public async Task<ActionResult<GameManager>> GetGame(string gameId);
    
    [HttpGet("active")]
    public async Task<ActionResult<List<GameManager>>> GetActiveGames();
    
    // Actions de jeu
    [HttpPost("{gameId}/start")]
    public async Task<ActionResult<bool>> StartGame(string gameId);
    
    [HttpPost("{gameId}/next-phase")]
    public async Task<ActionResult<bool>> NextPhase(string gameId);
    
    [HttpPost("{gameId}/vote")]
    public async Task<ActionResult<bool>> Vote(string gameId, [FromBody] VoteRequest request);
    
    [HttpPost("{gameId}/action")]
    public async Task<ActionResult<GameActionResult>> PerformAction(string gameId, [FromBody] GameActionRequest request);
    
    [HttpPost("{gameId}/chair")]
    public async Task<ActionResult<bool>> SelectChair(string gameId, [FromBody] ChairSelectionRequest request);
}
```

#### **Exemple de Requête de Vote**
```json
POST /api/game/{gameId}/vote
{
    "voterId": "player123",
    "targetId": "player456",
    "voteType": "Accusation"
}
```

#### **Exemple de Requête d'Action**
```json
POST /api/game/{gameId}/action
{
    "playerId": "player123",
    "actionType": "UsePower",
    "targetPlayerId": "player456",
    "data": {
        "powerLevel": 3,
        "additionalInfo": "Voyance nocturne"
    }
}
```

### 🏠 LobbyController

Gère la création et la gestion des lobbies.

#### **Endpoints Principaux**
```csharp
[ApiController]
[Route("api/[controller]")]
public class LobbyController : ControllerBase
{
    // Gestion des lobbies
    [HttpPost("create")]
    public async Task<ActionResult<Lobby>> CreateLobby([FromBody] CreateLobbyRequest request);
    
    [HttpGet("{lobbyId}")]
    public async Task<ActionResult<Lobby>> GetLobby(string lobbyId);
    
    [HttpGet("open")]
    public async Task<ActionResult<List<Lobby>>> GetOpenLobbies();
    
    // Gestion des joueurs
    [HttpPost("{lobbyId}/join")]
    public async Task<ActionResult<bool>> JoinLobby(string lobbyId, [FromBody] JoinLobbyRequest request);
    
    [HttpPost("{lobbyId}/leave")]
    public async Task<ActionResult<bool>> LeaveLobby(string lobbyId, [FromBody] LeaveLobbyRequest request);
    
    [HttpPost("{lobbyId}/ready")]
    public async Task<ActionResult<bool>> UpdateReady(string lobbyId, [FromBody] UpdateReadyRequest request);
    
    // Messages
    [HttpPost("{lobbyId}/message")]
    public async Task<ActionResult<bool>> SendMessage(string lobbyId, [FromBody] SendMessageRequest request);
    
    [HttpGet("{lobbyId}/messages")]
    public async Task<ActionResult<List<LobbyMessage>>> GetMessages(string lobbyId, [FromQuery] int count = 50);
}
```

---

## 📡 SignalR Hubs

### 🎯 GameHub

Gère la communication en temps réel pour le jeu.

#### **Méthodes du Hub**
```csharp
public class GameHub : Hub
{
    // Connexion et gestion des groupes
    public async Task JoinGame(string gameId);
    public async Task LeaveGame(string gameId);
    public async Task JoinLobby(string lobbyId);
    public async Task LeaveLobby(string lobbyId);
    
    // Actions de jeu en temps réel
    public async Task Vote(string gameId, string targetPlayerId, VoteType voteType);
    public async Task UsePower(string gameId, string targetPlayerId, Dictionary<string, object> powerData);
    public async Task SelectChair(string gameId, int chairNumber);
    public async Task SendMessage(string gameId, string content, MessageType messageType);
    
    // Gestion des connexions
    public override async Task OnConnectedAsync();
    public override async Task OnDisconnectedAsync(Exception? exception);
}
```

#### **Événements SignalR**
```csharp
// Côté client (Flutter)
hubConnection.on("PlayerJoined", (Player player) {
    // Un joueur a rejoint la partie
});

hubConnection.on("PhaseChanged", (GamePhase newPhase, int timeRemaining) {
    // La phase a changé
});

hubConnection.on("VoteReceived", (string voterId, string targetId, VoteType voteType) {
    // Un vote a été reçu
});

hubConnection.on("ActionPerformed", (GameActionResult result) {
    // Une action a été effectuée
});

hubConnection.on("GameEnded", (string winnerTeam, List<Player> alivePlayers) {
    // La partie est terminée
});
```

---

## 🗄️ Base de Données

### 🏗️ WendigoGameContext

Contexte Entity Framework Core pour la persistance des données.

#### **DbSets Principaux**
```csharp
public class WendigoGameContext : DbContext
{
    // Tables principales
    public DbSet<Player> Players { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Lobby> Lobbies { get; set; }
    public DbSet<LobbyPlayer> LobbyPlayers { get; set; }
    public DbSet<LobbyMessage> LobbyMessages { get; set; }
    
    // Tables de support
    public DbSet<Vote> Votes { get; set; }
    public DbSet<PlayerAction> PlayerActions { get; set; }
    public DbSet<GameMessage> GameMessages { get; set; }
    public DbSet<PlayerNote> PlayerNotes { get; set; }
    public DbSet<GameEvent> GameEvents { get; set; }
    public DbSet<DisplayMessage> DisplayMessages { get; set; }
}
```

#### **Configuration des Entités**
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Configuration des clés primaires
    modelBuilder.Entity<Game>(entity =>
    {
        entity.HasKey(g => g.Id);
        entity.Property(g => g.Id).IsRequired().HasMaxLength(100);
        entity.Property(g => g.Name).IsRequired().HasMaxLength(100);
        entity.Property(g => g.LobbyId).IsRequired().HasMaxLength(100);
        
        // Relations
        entity.HasMany(g => g.GameEvents)
              .WithOne()
              .HasForeignKey(e => e.GameId)
              .OnDelete(DeleteBehavior.Cascade);
              
        entity.HasMany(g => g.GameMessages)
              .WithOne()
              .HasForeignKey(m => m.GameId)
              .OnDelete(DeleteBehavior.Cascade);
    });
    
    // Configuration des enums
    modelBuilder.Entity<Game>()
        .Property(g => g.Status)
        .HasConversion<string>();
        
    modelBuilder.Entity<Game>()
        .Property(g => g.CurrentPhase)
        .HasConversion<string>();
}
```

#### **Index de Performance**
```csharp
// Index pour les performances
modelBuilder.Entity<Player>()
    .HasIndex(p => p.UserId);

modelBuilder.Entity<Player>()
    .HasIndex(p => p.GameId);

modelBuilder.Entity<GameEvent>()
    .HasIndex(ge => ge.GameId);

modelBuilder.Entity<GameEvent>()
    .HasIndex(ge => ge.Timestamp);
```

---

## 🧪 Tests et TestRunner

### 🎯 WendigoGame.TestRunner

Projet de tests avancés avec simulation complète de parties.

#### **GameSimulationTest.cs**
```csharp
public class GameSimulationTest
{
    private List<Player> _players;
    private GameManager _gameManager;
    private Mock<IGameService> _mockGameService;
    
    [Fact]
    public async Task SimulateCompleteGame_ShouldCompleteSuccessfully()
    {
        // Arrange
        SetupGameWithPlayers(8);
        SetupMockService();
        
        // Act - Simulation d'une partie complète
        await SimulateGameStart();
        await SimulateDayPhase();
        await SimulateEveningPhase();
        await SimulateNightPhase();
        await SimulateWakeUpPhase();
        await SimulateGameEnd();
        
        // Assert
        Assert.True(_gameManager.Status == GameStatus.Finished);
        Assert.NotNull(_gameManager.WinnerTeam);
        Assert.All(_gameManager.Players, p => Assert.False(p.IsAlive));
    }
    
    private async Task SimulateDayPhase()
    {
        // Simulation de la phase de jour
        foreach (Player player in _players.Where(p => p.IsAlive))
        {
            // Sélection de chaises
            int chairNumber = Random.Shared.Next(1, 9);
            await _gameManager.SelectChairAsync(player.Id, chairNumber);
            
            // Messages de discussion
            await _gameManager.SendMessageAsync(player.Id, $"Discussion du jour - Tour {_gameManager.NbTurn}");
        }
        
        // Passage à la phase suivante
        await _gameManager.NextPhaseAsync();
    }
    
    private async Task SimulateNightPhase()
    {
        // Simulation des actions nocturnes
        var wolfPlayers = _players.Where(p => p.Team == Team.Wolves && p.IsAlive).ToList();
        
        foreach (Player wolf in wolfPlayers)
        {
            // Vote des loups pour une victime
            var targetPlayer = _players.First(p => p.Team == Team.Village && p.IsAlive);
            await _gameManager.ProcessVoteAsync(wolf.Id, targetPlayer.Id, VoteType.WolfKill);
        }
        
        // Résolution des actions nocturnes
        await _gameManager.ProcessNightActionsAsync();
    }
}
```

#### **TestRunner.cs**
```csharp
public class TestRunner
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("🐺 Démarrage des tests WendigoGame...");
        
        // Tests de simulation
        await RunGameSimulationTests();
        
        // Tests de performance
        await RunPerformanceTests();
        
        // Tests de stress
        await RunStressTests();
        
        Console.WriteLine("✅ Tous les tests sont terminés !");
    }
    
    private static async Task RunGameSimulationTests()
    {
        var test = new GameSimulationTest();
        
        Console.WriteLine("🎮 Test de simulation de partie...");
        await test.SimulateCompleteGame_ShouldCompleteSuccessfully();
        
        Console.WriteLine("🎮 Test de simulation avec différents nombres de joueurs...");
        await test.SimulateGameWithDifferentPlayerCounts();
        
        Console.WriteLine("🎮 Test de simulation avec différents rôles...");
        await test.SimulateGameWithDifferentRoles();
    }
}
```

### 🧪 WendigoGame.API.Tests

Tests unitaires classiques pour la logique métier.

#### **GameSimulationTest.cs (Tests Unitaires)**
```csharp
public class GameSimulationTest
{
    [Fact]
    public void CreateGame_WithValidLobby_ShouldSucceed()
    {
        // Arrange
        var lobby = new Lobby
        {
            Id = "lobby123",
            Name = "Test Lobby",
            Players = CreateTestPlayers(8)
        };
        
        var gameService = new GameService(mockContext, mockLogger);
        
        // Act
        var result = gameService.CreateGameAsync(lobby.Id).Result;
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(GameStatus.Waiting, result.Status);
        Assert.Equal(8, result.Players.Count);
    }
    
    [Fact]
    public void GamePhaseTransition_ShouldUpdateTimers()
    {
        // Arrange
        var gameManager = CreateTestGameManager();
        
        // Act
        var initialTime = gameManager.TimeRemaining;
        gameManager.NextPhaseAsync().Wait();
        
        // Assert
        Assert.NotEqual(initialTime, gameManager.TimeRemaining);
    }
}
```

#### **ManualTest.cs**
```csharp
public class ManualTest
{
    [Fact]
    public void TestRoleAssignment_ShouldBeBalanced()
    {
        // Test manuel de l'équilibrage des rôles
        var roles = RoleFactory.CreateBalancedRoleSet(12);
        
        var wolfCount = roles.Count(r => r.Team == Team.Wolves);
        var villagerCount = roles.Count(r => r.Team == Team.Village);
        
        Assert.Equal(3, wolfCount);  // 25% de loups
        Assert.Equal(9, villagerCount); // 75% de villageois
    }
}
```

---

## ⚙️ Configuration et Déploiement

### 🔧 appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=WendigoGame;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "WendigoGame",
    "Audience": "WendigoGameUsers",
    "ExpirationMinutes": 60
  },
  "GameSettings": {
    "DefaultPhaseDuration": "00:10:00",
    "MinPlayers": 8,
    "MaxPlayers": 29,
    "VibrationPattern": "100,200,300,400,500",
    "ChairSelectionTimeout": "00:02:00"
  }
}
```

### 🚀 Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework
builder.Services.AddDbContext<WendigoGameContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// SignalR
builder.Services.AddSignalR();

// Services métier
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<ILobbyService, LobbyService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFlutter", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFlutter");
app.UseAuthorization();
app.MapControllers();
app.MapHub<GameHub>("/gamehub");

app.Run();
```

---

## 🛠️ Guide de Développement

### 📋 Prérequis

- **.NET Core 8.0 SDK**
- **SQL Server** (ou SQL Server Express)
- **Visual Studio 2022** ou **VS Code**
- **Git**

### 🚀 Première Exécution

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WendigoGame/backend
```

2. **Restaurer les packages**
```bash
dotnet restore
```

3. **Créer la base de données**
```bash
dotnet ef database update
```

4. **Lancer l'API**
```bash
cd WendigoGame.API
dotnet run
```

5. **Lancer les tests**
```bash
cd ../WendigoGame.TestRunner
dotnet run
```

### 🔧 Commandes Utiles

#### **Développement**
```bash
# Lancer l'API en mode développement
dotnet run --environment Development

# Lancer avec hot reload
dotnet watch run

# Vérifier la compilation
dotnet build

# Nettoyer
dotnet clean
```

#### **Tests**
```bash
# Lancer tous les tests
dotnet test

# Lancer les tests avec couverture
dotnet test --collect:"XPlat Code Coverage"

# Lancer un projet de test spécifique
dotnet test WendigoGame.API.Tests
dotnet test WendigoGame.TestRunner
```

#### **Base de Données**
```bash
# Créer une migration
dotnet ef migrations add InitialCreate

# Appliquer les migrations
dotnet ef database update

# Supprimer la base
dotnet ef database drop

# Générer un script SQL
dotnet ef migrations script
```

### 🐛 Débogage

#### **Logs**
```csharp
_logger.LogInformation("Démarrage de la partie {GameId}", gameId);
_logger.LogWarning("Joueur {PlayerId} a quitté la partie", playerId);
_logger.LogError("Erreur lors du traitement du vote: {Error}", ex.Message);
```

#### **Configuration de Logging**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "WendigoGame.API.Services": "Debug",
      "WendigoGame.API.Hubs": "Debug"
    }
  }
}
```

### 📊 Monitoring et Performance

#### **Métriques à Surveiller**
- **Temps de réponse des API** : < 200ms
- **Connexions SignalR actives** : < 1000
- **Utilisation mémoire** : < 512MB
- **Temps de traitement des actions** : < 100ms

#### **Optimisations Recommandées**
- **Mise en cache** des données fréquemment accédées
- **Pagination** des résultats de requêtes
- **Index de base de données** sur les colonnes de recherche
- **Compression** des réponses HTTP

---

## 🔮 Évolutions Futures

### 🎯 Fonctionnalités Prévues

1. **Système de Statistiques**
   - Historique des parties
   - Performance des joueurs
   - Analyse des stratégies gagnantes

2. **Mode Tournoi**
   - Compétitions multi-parties
   - Classements et récompenses
   - Éliminatoires et finales

3. **Rôles Personnalisés**
   - Création de rôles par les joueurs
   - Équilibrage automatique
   - Validation communautaire

4. **Intégration IA**
   - Analyse des comportements
   - Détection de triche
   - Suggestions de stratégies

### 🏗️ Améliorations Techniques

1. **Microservices**
   - Séparation des responsabilités
   - Scalabilité horizontale
   - Déploiement indépendant

2. **Event Sourcing**
   - Historique complet des événements
   - Replay des parties
   - Audit trail

3. **API GraphQL**
   - Requêtes flexibles
   - Réduction du trafic réseau
   - Documentation interactive

---

## 📚 Ressources et Références

### 🔗 Documentation Officielle
- [.NET Core Documentation](https://docs.microsoft.com/en-us/dotnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr/)
- [ASP.NET Core Web API](https://docs.microsoft.com/en-us/aspnet/core/web-api/)

### 🧪 Outils de Test
- [xUnit Documentation](https://xunit.net/)
- [Moq Framework](https://github.com/moq/moq4)
- [Entity Framework Testing](https://docs.microsoft.com/en-us/ef/core/testing/)

### 🎮 Jeux de Référence
- [Werewolf (Mafia)](https://en.wikipedia.org/wiki/Mafia_(party_game))
- [One Night Ultimate Werewolf](https://beziergames.com/products/one-night-ultimate-werewolf)
- [Blood on the Clocktower](https://bloodontheclocktower.com/)

---

## 📞 Support et Contact

### 🐛 Signaler un Bug
- **GitHub Issues** : [Repository Issues](https://github.com/your-repo/issues)
- **Email** : support@wendigogame.com
- **Discord** : [Serveur Communauté](https://discord.gg/wendigogame)

### 💡 Proposer une Fonctionnalité
- **GitHub Discussions** : [Feature Requests](https://github.com/your-repo/discussions)
- **Roadmap** : [Projet GitHub](https://github.com/your-repo/projects)

### 🤝 Contribuer
- **Fork** le projet
- **Créer** une branche feature
- **Commiter** vos changements
- **Pousser** vers la branche
- **Ouvrir** une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**🎉 Merci d'avoir lu cette documentation complète !**

N'hésitez pas à la consulter régulièrement lors du développement. Elle sera mise à jour au fur et à mesure de l'évolution du projet.

