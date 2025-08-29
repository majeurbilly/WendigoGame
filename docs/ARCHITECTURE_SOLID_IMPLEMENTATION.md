# 🏗️ Architecture SOLID - Guide d'Implémentation

## 🎯 **Pourquoi Refactoriser vers SOLID ?**

### **❌ Problèmes de l'Architecture Actuelle :**
1. **Classes monolithiques** qui font trop de choses
2. **Dépendances concrètes** difficiles à tester et modifier
3. **Code rigide** qui casse facilement lors des modifications
4. **Difficile d'ajouter** de nouveaux rôles ou pouvoirs
5. **Tests complexes** à cause des couplages forts

### **✅ Avantages de l'Architecture SOLID :**
1. **Extensibilité** : Ajouter de nouveaux rôles sans modifier le code existant
2. **Testabilité** : Chaque composant peut être testé isolément
3. **Maintenabilité** : Modifications locales sans impact global
4. **Flexibilité** : Changer d'implémentation sans casser l'interface
5. **Réutilisabilité** : Composants réutilisables dans différents contextes

## 🔌 **1. PRINCIPE DE RESPONSABILITÉ UNIQUE (SRP)**

### **Interfaces de Base :**
```typescript
// Chaque interface a une seule responsabilité
interface IEntity {
    id: UUID;
    created_at: DateTime;
    updated_at: DateTime;
}

interface IIdentifiable {
    id: UUID;
}

interface ITimestamped {
    created_at: DateTime;
    updated_at: DateTime;
}

interface IValidatable {
    validate(): boolean;
    get_validation_errors(): string[];
}
```

### **Implémentation :**
```typescript
class User implements IEntity, IIdentifiable, ITimestamped, IValidatable {
    constructor(
        public id: UUID,
        public username: string,
        public email: string,
        public password_hash: string,
        public created_at: DateTime,
        public updated_at: DateTime,
        public is_active: boolean
    ) {}

    validate(): boolean {
        return this.username.length > 0 && 
               this.email.includes('@') && 
               this.password_hash.length > 0;
    }

    get_validation_errors(): string[] {
        const errors: string[] = [];
        if (this.username.length === 0) errors.push('Username is required');
        if (!this.email.includes('@')) errors.push('Invalid email format');
        if (this.password_hash.length === 0) errors.push('Password is required');
        return errors;
    }
}
```

## 🚪 **2. PRINCIPE OUVERT/FERMÉ (OCP)**

### **Système de Rôles Extensible :**
```typescript
// Interface fermée pour modification, ouverte pour extension
interface IRole {
    id: UUID;
    name: string;
    description: string;
    team: ITeam;
    can_use_power(power: IPower, context: IGameContext): boolean;
    execute_power(power: IPower, target: IPlayer, context: IGameContext): IPowerResult;
}

// Classe de base qui peut être étendue
abstract class BaseRole implements IRole, IEntity {
    constructor(
        public id: UUID,
        public name: string,
        public description: string,
        public team: ITeam,
        public phase_action: IPhase,
        public is_unique: boolean
    ) {}

    abstract can_use_power(power: IPower, context: IGameContext): boolean;
    abstract execute_power(power: IPower, target: IPlayer, context: IGameContext): IPowerResult;

    get_power_description(): string {
        return `${this.name}: ${this.description}`;
    }
}

// Extension sans modification du code existant
class MarchandDeSable extends BaseRole {
    private can_skip_accusation_phase: boolean = true;

    can_use_power(power: IPower, context: IGameContext): boolean {
        return power.power_type === PowerType.TIME_MANIPULATION && 
               context.phase.name === 'ACCUSATION';
    }

    execute_power(power: IPower, target: IPlayer, context: IGameContext): IPowerResult {
        if (power.power_type === PowerType.TIME_MANIPULATION) {
            return this.skip_accusation_phase(context);
        }
        return { success: false, message: 'Power not applicable' };
    }

    private skip_accusation_phase(context: IGameContext): IPowerResult {
        // Logique spécifique au Marchand de Sable
        return { 
            success: true, 
            message: 'Accusation phase skipped',
            effects: []
        };
    }
}
```

## 🔄 **3. PRINCIPE DE SUBSTITUTION DE LISKOV (LSP)**

### **Polymorphisme des Rôles :**
```typescript
// Tous les rôles peuvent être utilisés de manière interchangeable
class RoleManager {
    private roles: IRole[] = [];

    add_role(role: IRole): void {
        this.roles.push(role);
    }

    get_role_by_name(name: string): IRole | null {
        return this.roles.find(role => role.name === name) || null;
    }

    // Fonctionne avec n'importe quel type de rôle
    execute_role_power(role: IRole, power: IPower, target: IPlayer, context: IGameContext): IPowerResult {
        if (role.can_use_power(power, context)) {
            return role.execute_power(power, target, context);
        }
        return { success: false, message: 'Power cannot be used' };
    }
}

// Utilisation polymorphique
const roleManager = new RoleManager();
roleManager.add_role(new Villager(uuid(), 'Villager', 'Basic villager', new VillagerTeam()));
roleManager.add_role(new MarchandDeSable(uuid(), 'Marchand de Sable', 'Time manipulator', new NeutralTeam()));

// Tous les rôles peuvent être utilisés de la même manière
const villager = roleManager.get_role_by_name('Villager');
const marchand = roleManager.get_role_by_name('Marchand de Sable');

// Même interface, comportements différents
const result1 = roleManager.execute_role_power(villager!, power, target, context);
const result2 = roleManager.execute_role_power(marchand!, power, target, context);
```

## 🎯 **4. PRINCIPE DE SÉGRÉGATION DES INTERFACES (ISP)**

### **Interfaces Granulaires :**
```typescript
// Au lieu d'une grosse interface, plusieurs petites interfaces
interface IPower {
    id: UUID;
    name: string;
    description: string;
    can_use(context: IGameContext): boolean;
    execute(target: IPlayer, context: IGameContext): IPowerResult;
}

interface IUsablePower extends IPower {
    usage_limit: number;
    current_usage: number;
    reset_usage(): void;
}

interface ITargetablePower extends IPower {
    target_type: TargetType;
    validate_target(target: IPlayer): boolean;
}

interface ITimedPower extends IPower {
    phase_activation: IPhase;
    duration: number;
    is_expired(): boolean;
}

// Implémentation qui n'implémente que ce dont elle a besoin
class KillPower implements IUsablePower, ITargetablePower {
    constructor(
        public id: UUID,
        public name: string,
        public description: string,
        public usage_limit: number,
        public current_usage: number,
        public target_type: TargetType
    ) {}

    can_use(context: IGameContext): boolean {
        return this.current_usage < this.usage_limit;
    }

    execute(target: IPlayer, context: IGameContext): IPowerResult {
        if (!this.validate_target(target)) {
            return { success: false, message: 'Invalid target' };
        }
        
        this.current_usage++;
        return { success: true, message: 'Target killed', effects: [] };
    }

    validate_target(target: IPlayer): boolean {
        return target.is_alive && target.team.name !== 'WOLF';
    }

    reset_usage(): void {
        this.current_usage = 0;
    }
}
```

## 🔀 **5. PRINCIPE D'INVERSION DES DÉPENDANCES (DIP)**

### **Injection de Dépendances :**
```typescript
// Dépendre d'abstractions, pas de concrétions
interface IGameRepository {
    save(game: IGame): void;
    find_by_id(game_id: UUID): IGame | null;
    find_all(): IGame[];
    delete(game_id: UUID): void;
}

interface IRoleFactory {
    create_role(role_type: RoleType, role_data: RoleData): IRole;
    create_custom_role(role_data: RoleData): IRole;
}

// Service qui dépend d'interfaces
class GameManager implements IGameManager {
    constructor(
        private game_repository: IGameRepository,
        private role_factory: IRoleFactory
    ) {}

    create_game(name: string, max_players: number): IGame {
        const game = new Game(uuid(), name, max_players);
        this.game_repository.save(game);
        return game;
    }

    get_game(game_id: UUID): IGame | null {
        return this.game_repository.find_by_id(game_id);
    }
}

// Configuration des dépendances
class GameServiceFactory {
    static create_game_manager(): IGameManager {
        const game_repository = new PostgreSQLGameRepository();
        const role_factory = new RoleFactory();
        return new GameManager(game_repository, role_factory);
    }
}

// Utilisation
const gameManager = GameServiceFactory.create_game_manager();
```

## 🏭 **6. PATTERNS DE CONCEPTION UTILISÉS**

### **Factory Pattern :**
```typescript
class RoleFactory implements IRoleFactory {
    private role_templates: Map<RoleType, IRoleTemplate> = new Map();

    constructor() {
        this.register_default_roles();
    }

    create_role(role_type: RoleType, role_data: RoleData): IRole {
        const template = this.role_templates.get(role_type);
        if (!template) {
            throw new Error(`Unknown role type: ${role_type}`);
        }

        return template.create_role(role_data);
    }

    create_custom_role(role_data: RoleData): IRole {
        return new CustomRole(
            uuid(),
            role_data.name,
            role_data.description,
            role_data.team,
            role_data.powers
        );
    }

    private register_default_roles(): void {
        this.role_templates.set(RoleType.VILLAGER, new VillagerTemplate());
        this.role_templates.set(RoleType.WOLF, new WolfTemplate());
        this.role_templates.set(RoleType.MARCHAND_DE_SABLE, new MarchandDeSableTemplate());
    }
}
```

### **Repository Pattern :**
```typescript
class PostgreSQLGameRepository implements IGameRepository {
    constructor(private database: IDatabase) {}

    async save(game: IGame): Promise<void> {
        const query = `
            INSERT INTO games (id, name, status, max_players, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                name = $2, status = $3, max_players = $4, updated_at = $6
        `;
        
        await this.database.execute(query, [
            game.id, game.name, game.status, game.max_players,
            game.created_at, game.updated_at
        ]);
    }

    async find_by_id(game_id: UUID): Promise<IGame | null> {
        const query = 'SELECT * FROM games WHERE id = $1';
        const result = await this.database.query(query, [game_id]);
        
        if (result.rows.length === 0) return null;
        
        return this.map_row_to_game(result.rows[0]);
    }

    private map_row_to_game(row: any): IGame {
        return new Game(
            row.id, row.name, row.max_players,
            new Date(row.created_at), new Date(row.updated_at)
        );
    }
}
```

### **Strategy Pattern :**
```typescript
interface IPowerExecutionStrategy {
    execute(power: IPower, target: IPlayer, context: IGameContext): IPowerResult;
}

class KillPowerStrategy implements IPowerExecutionStrategy {
    execute(power: IPower, target: IPlayer, context: IGameContext): IPowerResult {
        if (target.team.name === 'WOLF') {
            return { success: false, message: 'Cannot kill wolves' };
        }
        
        target.die();
        return { success: true, message: 'Target killed', effects: [] };
    }
}

class ProtectPowerStrategy implements IPowerExecutionStrategy {
    execute(power: IPower, target: IPlayer, context: IGameContext): IPowerResult {
        target.add_protection(power.duration);
        return { success: true, message: 'Target protected', effects: [] };
    }
}

class PowerExecutor {
    private strategies: Map<PowerType, IPowerExecutionStrategy> = new Map();

    constructor() {
        this.strategies.set(PowerType.KILL, new KillPowerStrategy());
        this.strategies.set(PowerType.PROTECT, new ProtectPowerStrategy());
    }

    execute_power(power: IPower, target: IPlayer, context: IGameContext): IPowerResult {
        const strategy = this.strategies.get(power.power_type);
        if (!strategy) {
            return { success: false, message: 'Unknown power type' };
        }

        return strategy.execute(power, target, context);
    }
}
```

## 🧪 **7. AVANTAGES POUR LES TESTS**

### **Tests Unitaires Simplifiés :**
```typescript
describe('GameManager', () => {
    let gameManager: IGameManager;
    let mockGameRepository: jest.Mocked<IGameRepository>;
    let mockRoleFactory: jest.Mocked<IRoleFactory>;

    beforeEach(() => {
        mockGameRepository = {
            save: jest.fn(),
            find_by_id: jest.fn(),
            find_all: jest.fn(),
            delete: jest.fn()
        };

        mockRoleFactory = {
            create_role: jest.fn(),
            create_custom_role: jest.fn()
        };

        gameManager = new GameManager(mockGameRepository, mockRoleFactory);
    });

    it('should create a new game', () => {
        const game = gameManager.create_game('Test Game', 10);
        
        expect(game.name).toBe('Test Game');
        expect(game.max_players).toBe(10);
        expect(mockGameRepository.save).toHaveBeenCalledWith(game);
    });

    it('should retrieve game by id', () => {
        const mockGame = new Game(uuid(), 'Test Game', 10);
        mockGameRepository.find_by_id.mockReturnValue(mockGame);

        const result = gameManager.get_game(mockGame.id);
        
        expect(result).toBe(mockGame);
        expect(mockGameRepository.find_by_id).toHaveBeenCalledWith(mockGame.id);
    });
});
```

## 🚀 **8. COMMENT AJOUTER UN NOUVEAU RÔLE**

### **Étape 1 : Créer la Classe du Rôle**
```typescript
class NouveauRole extends BaseRole {
    constructor() {
        super(
            uuid(),
            'Nouveau Role',
            'Description du nouveau rôle',
            new NeutralTeam(),
            Phase.NIGHT,
            true
        );
    }

    can_use_power(power: IPower, context: IGameContext): boolean {
        return power.power_type === PowerType.NOUVEAU_POUVOIR;
    }

    execute_power(power: IPower, target: IPlayer, context: IGameContext): IPowerResult {
        // Logique spécifique au nouveau rôle
        return { success: true, message: 'Nouveau pouvoir exécuté', effects: [] };
    }
}
```

### **Étape 2 : Enregistrer dans la Factory**
```typescript
// Dans RoleFactory
private register_default_roles(): void {
    // ... rôles existants
    this.role_templates.set(RoleType.NOUVEAU_ROLE, new NouveauRoleTemplate());
}
```

### **Étape 3 : Utiliser le Nouveau Rôle**
```typescript
// Le code existant fonctionne sans modification !
const nouveauRole = roleFactory.create_role(RoleType.NOUVEAU_ROLE, {});
game.add_player(new Player(uuid(), user_id, game_id, nouveauRole.id));
```

## 📋 **9. CHECKLIST DE REFACTORISATION**

- [ ] **Séparer les responsabilités** : Chaque classe a une seule raison de changer
- [ ] **Créer des interfaces** : Définir des contrats clairs pour chaque composant
- [ ] **Utiliser l'abstraction** : Dépendre d'interfaces, pas d'implémentations
- [ ] **Implémenter des factories** : Pour la création d'objets complexes
- [ ] **Utiliser des repositories** : Pour l'accès aux données
- [ ] **Injecter les dépendances** : Via constructeur ou conteneur DI
- [ ] **Écrire des tests** : Pour valider chaque composant isolément
- [ ] **Documenter les interfaces** : Expliquer le contrat de chaque interface

## 🎯 **10. BÉNÉFICES FINAUX**

1. **Ajout de nouveaux rôles** en quelques lignes de code
2. **Modifications locales** sans impact sur le reste du système
3. **Tests rapides** et fiables
4. **Code maintenable** et compréhensible
5. **Équipe productive** avec moins de bugs et de régressions

---

*Cette architecture SOLID transforme ton projet Wendigo Game en un système robuste, extensible et professionnel ! 🐺✨*
