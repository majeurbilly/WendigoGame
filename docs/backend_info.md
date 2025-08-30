# 🚀 Backend .NET Core - Wendigo Game

## 🎯 **Vue d'ensemble du Backend**

**Wendigo Game** utilise un **backend .NET Core robuste** qui fournit une API REST complète et une communication temps réel via SignalR. Ce backend s'intègre parfaitement avec la nouvelle architecture frontend **React Native + React Native Web**.

### 🌟 **Pourquoi .NET Core ?**

**Avantages du Backend .NET Core :**
- **Performance élevée** : Framework moderne et optimisé
- **SignalR intégré** : Communication temps réel native
- **Entity Framework** : ORM puissant pour la base de données
- **Sécurité robuste** : Authentication/Authorization intégrées
- **Scalabilité** : Prêt pour la production et le déploiement cloud

## 🏗️ **Architecture du Backend**

### **Structure du Projet**
```
backend/
├── Wendigame.API/           # Projet principal .NET Core
│   ├── Controllers/         # Contrôleurs API REST
│   ├── Models/              # Modèles de données
│   ├── Data/                # Contexte Entity Framework
│   ├── Services/            # Services métier
│   ├── Hubs/                # Hubs SignalR pour temps réel
│   ├── Middleware/          # Middleware personnalisé
│   ├── Program.cs           # Point d'entrée
│   └── appsettings.json     # Configuration
└── README.md
```

### **Technologies Utilisées**
- **.NET 10.0** : Framework le plus récent
- **ASP.NET Core Web API** : API REST moderne
- **Entity Framework Core** : ORM pour SQL Server
- **SignalR** : Communication temps réel
- **Swagger/OpenAPI** : Documentation automatique
- **SQL Server** : Base de données relationnelle

## 🔌 **Intégration avec React Native + Web**

### **1. API REST pour les Composants Partagés**
```typescript
// shared/services/api.ts
export const gameAPI = {
  // Toutes les opérations de jeu
  getGameState: (gameId: string) => 
    fetch(`/api/games/${gameId}`).then(r => r.json()),
  
  joinLobby: (lobbyId: string) => 
    fetch(`/api/lobbies/${lobbyId}/join`, { method: 'POST' }),
  
  submitVote: (gameId: string, targetId: string) => 
    fetch(`/api/games/${gameId}/vote`, { 
      method: 'POST', 
      body: JSON.stringify({ targetId }) 
    })
};
```

### **2. SignalR pour la Communication Temps Réel**
```typescript
// shared/services/signalR.ts
import { HubConnection } from '@microsoft/signalr';

export class GameHubService {
  private connection: HubConnection;

  async connect(gameId: string) {
    this.connection = new HubConnectionBuilder()
      .withUrl(`/gamehub?gameId=${gameId}`)
      .build();
    
    // Écouter les événements de jeu
    this.connection.on('PhaseChanged', (phase) => {
      // Mise à jour de la phase en temps réel
    });
    
    this.connection.on('PlayerAction', (action) => {
      // Action d'un joueur en temps réel
    });
  }
}
```

### **3. Endpoints API Principaux**

#### **Gestion des Lobbys**
```csharp
[ApiController]
[Route("api/[controller]")]
public class LobbyController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Lobby>>> GetLobbies()
    
    [HttpPost]
    public async Task<ActionResult<Lobby>> CreateLobby(CreateLobbyRequest request)
    
    [HttpPost("{id}/join")]
    public async Task<ActionResult> JoinLobby(string id, JoinLobbyRequest request)
}
```

#### **Gestion des Parties**
```csharp
[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<GameState>> GetGameState(string id)
    
    [HttpPost("{id}/start")]
    public async Task<ActionResult> StartGame(string id)
    
    [HttpPost("{id}/vote")]
    public async Task<ActionResult> SubmitVote(string id, VoteRequest request)
}
```

#### **Hub SignalR pour le Temps Réel**
```csharp
public class GameHub : Hub
{
    public async Task JoinGame(string gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.Group(gameId).SendAsync("PlayerJoined", Context.User.Identity.Name);
    }
    
    public async Task SubmitAction(string gameId, PlayerAction action)
    {
        // Traitement de l'action
        await Clients.Group(gameId).SendAsync("ActionProcessed", action);
    }
}
```

## 📊 **Modèles de Données**

### **Entités Principales**
```csharp
public class Player
{
    public string Id { get; set; }
    public string Name { get; set; }
    public Role Role { get; set; }
    public bool IsAlive { get; set; }
    public Team Team { get; set; }
    public int ChairNumber { get; set; }
}

public class Game
{
    public string Id { get; set; }
    public GamePhase Phase { get; set; }
    public DateTime PhaseStartTime { get; set; }
    public int PhaseDuration { get; set; }
    public List<Player> Players { get; set; }
    public GameStatus Status { get; set; }
}

public class Lobby
{
    public string Id { get; set; }
    public string Name { get; set; }
    public int MinPlayers { get; set; }
    public int MaxPlayers { get; set; }
    public List<Player> Players { get; set; }
    public LobbyStatus Status { get; set; }
}
```

## 🔄 **Communication Temps Réel**

### **Événements SignalR**
```typescript
// Événements émis par le serveur
interface GameEvents {
  'PhaseChanged': (phase: GamePhase, timeRemaining: number) => void;
  'PlayerAction': (action: PlayerAction) => void;
  'VoteSubmitted': (vote: Vote) => void;
  'GameEnded': (result: GameResult) => void;
  'PlayerDied': (playerId: string, cause: string) => void;
  'ChairSelected': (playerId: string, chairNumber: number) => void;
}
```

### **Actions des Joueurs**
```typescript
// Actions envoyées par les clients
interface PlayerActions {
  'SelectChair': (chairNumber: number) => void;
  'SubmitVote': (targetId: string) => void;
  'UsePower': (powerType: string, targetId?: string) => void;
  'SendMessage': (message: string, chatType: string) => void;
}
```

## 🚀 **Démarrage Rapide**

### **1. Génération du Projet**
```bash
dotnet new webapi -n Wendigame.API
cd backend/Wendigame.API
```

### **2. Ajout des Dépendances**
```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.SignalR
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### **3. Configuration de la Base de Données**
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=WendigoGame;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### **4. Lancement de l'API**
```bash
dotnet run
```
Puis ouvrez : `https://localhost:7001/swagger`

## 🔧 **Configuration pour React Native + Web**

### **CORS Configuration**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

### **SignalR Configuration**
```csharp
// Program.cs
builder.Services.AddSignalR();

app.MapHub<GameHub>("/gamehub");
```

### **Authentication JWT**
```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
```

## 📱 **Intégration Mobile et Web**

### **Mobile (React Native)**
- **APIs natives** : Vibration, notifications push
- **SignalR** : Communication temps réel optimisée
- **Stockage local** : AsyncStorage pour les préférences

### **Web (React Native Web)**
- **APIs web** : Notifications, sons, alertes
- **SignalR** : WebSocket natif du navigateur
- **Stockage web** : localStorage, sessionStorage

### **Code Partagé**
- **Services API** : Même logique d'appel
- **Gestion d'état** : Même état de jeu
- **Composants** : Même interface utilisateur

## 🎯 **Avantages de cette Architecture**

### **Pour le Développement**
- **Backend robuste** : .NET Core performant et stable
- **API unifiée** : Même endpoints pour mobile et web
- **Temps réel** : SignalR pour la synchronisation
- **Documentation** : Swagger automatique

### **Pour l'Utilisateur**
- **Expérience cohérente** : Même logique de jeu partout
- **Performance** : API optimisée et responsive
- **Fiabilité** : Backend enterprise-grade
- **Scalabilité** : Prêt pour la production

### **Pour la Maintenance**
- **Code centralisé** : Une seule API à maintenir
- **Tests unifiés** : Même suite de tests
- **Déploiement** : Un seul backend à déployer
- **Monitoring** : Métriques centralisées

## 🔮 **Évolution Future**

### **Court terme (1-3 mois)**
- API complète pour le jeu Wendigo
- Tests et optimisation
- Documentation complète

### **Moyen terme (3-6 mois)**
- Authentification avancée
- Analytics et métriques
- Cache et performance

### **Long terme (6+ mois)**
- Microservices
- Cloud native
- IA et machine learning

---

## 🎉 **Conclusion**

Le **backend .NET Core** de Wendigo Game fournit une **base solide et performante** qui s'intègre parfaitement avec l'architecture **React Native + React Native Web**. Cette combinaison nous permet de :

✅ **Développer rapidement** avec des outils modernes  
✅ **Maintenir la qualité** avec une architecture robuste  
✅ **Scaler facilement** pour la production  
✅ **Offrir une expérience unifiée** sur toutes les plateformes  

Le backend .NET Core est la **colonne vertébrale** qui rend possible la vision unifiée de Wendigo Game ! 🐺✨

---

*Wendigo Game - Backend .NET Core + Frontend React Native Unifié*