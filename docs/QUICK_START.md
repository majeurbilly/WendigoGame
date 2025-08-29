# 🚀 Démarrage Rapide - Wendigo Game

## ⚡ **Démarrer en 5 Minutes**

### **1. 📖 Lire l'Architecture (2 min)**
- [Architecture SOLID](./ARCHITECTURE_SOLID_IMPLEMENTATION.md) - Comprendre les principes
- [Exemples d'Architecture](./ARCHITECTURE_EXAMPLE.md) - Voir le code en action

### **2. 🏗️ Visualiser la Structure (1 min)**
- [Diagramme SOLID](./INTERFACES_SOLID.puml) - Architecture des interfaces
- [Diagramme Complet](./WENDIGO_GAME_COMPLETE.puml) - Vue d'ensemble du projet

### **3. 📋 Planifier le Développement (2 min)**
- [Roadmap Détaillé](./ROADMAP_DETAILED.md) - Planification par phases
- [Documentation Technique](./WENDIGO_GAME_DOCUMENTATION.md) - Spécifications du jeu

## 🎯 **Première Implémentation (30 min)**

### **Étape 1 : Créer les Interfaces de Base**
```typescript
// src/core/interfaces/IEntity.ts
export interface IEntity {
    id: string;
    created_at: Date;
    updated_at: Date;
}

// src/core/interfaces/IValidatable.ts
export interface IValidatable {
    validate(): boolean;
    get_validation_errors(): string[];
}
```

### **Étape 2 : Implémenter la Première Entité**
```typescript
// src/models/User.ts
export class User implements IEntity, IValidatable {
    constructor(
        public id: string,
        public username: string,
        public email: string,
        public created_at: Date = new Date(),
        public updated_at: Date = new Date()
    ) {}

    validate(): boolean {
        return this.username.length > 0 && this.email.includes('@');
    }

    get_validation_errors(): string[] {
        const errors: string[] = [];
        if (this.username.length === 0) errors.push('Username required');
        if (!this.email.includes('@')) errors.push('Invalid email');
        return errors;
    }
}
```

### **Étape 3 : Créer le Premier Service**
```typescript
// src/services/UserService.ts
export interface IUserService {
    createUser(username: string, email: string): User;
    getUserById(id: string): User | null;
}

export class UserService implements IUserService {
    private users: Map<string, User> = new Map();

    createUser(username: string, email: string): User {
        const user = new User(
            crypto.randomUUID(),
            username,
            email
        );
        
        if (!user.validate()) {
            throw new Error(`Invalid user: ${user.get_validation_errors().join(', ')}`);
        }
        
        this.users.set(user.id, user);
        return user;
    }

    getUserById(id: string): User | null {
        return this.users.get(id) || null;
    }
}
```

## 🧪 **Premier Test (10 min)**

```typescript
// tests/UserService.test.ts
describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    it('should create a valid user', () => {
        const user = userService.createUser('testuser', 'test@example.com');
        
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
        expect(user.validate()).toBe(true);
    });

    it('should throw error for invalid user', () => {
        expect(() => {
            userService.createUser('', 'invalid-email');
        }).toThrow('Invalid user');
    });
});
```

## 🔧 **Configuration de l'Environnement**

### **Backend (FastAPI)**
```bash
# Créer l'environnement
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install fastapi uvicorn sqlalchemy pydantic
```

### **Frontend (React + TypeScript)**
```bash
# Créer le projet
npx create-react-app frontend --template typescript
cd frontend

# Installer les dépendances
npm install axios @types/axios
```

## 📁 **Structure de Projet Recommandée**

```
WendigoGame/
├── backend/
│   ├── app/
│   │   ├── core/           # Interfaces et abstractions
│   │   ├── models/         # Entités métier
│   │   ├── services/       # Logique métier
│   │   └── api/            # Routes FastAPI
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── core/           # Interfaces TypeScript
│   │   ├── models/         # Modèles de données
│   │   ├── services/       # Services API
│   │   └── components/     # Composants React
│   └── tests/
└── docs/                   # Documentation
```

## 🎯 **Prochaines Étapes**

1. **Implémenter** les interfaces de base (IEntity, IValidatable)
2. **Créer** les premiers modèles (User, Game, Player)
3. **Développer** les services de base (UserService, GameService)
4. **Tester** chaque composant isolément
5. **Ajouter** de nouveaux rôles pour valider l'extensibilité

## 🆘 **Besoin d'Aide ?**

- **Architecture** → [Architecture SOLID](./ARCHITECTURE_SOLID_IMPLEMENTATION.md)
- **Planification** → [Roadmap](./ROADMAP_DETAILED.md)
- **Spécifications** → [Documentation Technique](./WENDIGO_GAME_DOCUMENTATION.md)
- **Diagrammes** → [UML](./INTERFACES_SOLID.puml)

---

*Tu es maintenant prêt à développer un système Wendigo Game robuste et extensible ! 🐺✨*
