# 🎮 Wendigo Game - Frontend Web

## 📚 **COMPRENDRE REACT EN 5 MINUTES**

### **1. Structure des dossiers (comme en C#)**
```
src/                    ← VOTRE CODE (comme vos .cs files)
├── index.tsx          ← Point d'entrée (comme Main() en C#)
├── App.tsx            ← Composant principal (comme Program.cs)
├── components/        ← Composants réutilisables (comme des classes)
└── services/          ← Services API (comme des services C#)

public/                ← Fichiers statiques (images, HTML de base)
package.json           ← Dépendances (comme .csproj)
tsconfig.json          ← Configuration TypeScript
```

### **2. Comment ça marche (analogie C#)**

#### **En C# :**
```csharp
// Program.cs
class Program {
    static void Main() {
        var app = new MonApplication();
        app.Demarrer();
    }
}

// MonApplication.cs
class MonApplication {
    public void Demarrer() {
        // Logique de l'app
    }
}
```

#### **En React :**
```typescript
// index.tsx (comme Main())
ReactDOM.render(<App />, document.getElementById('root'));

// App.tsx (comme Program.cs)
function App() {
    return (
        <div>
            {/* Interface de l'app */}
        </div>
    );
}
```

### **3. Composants = Classes C#**
```typescript
// LoginForm.tsx (comme une classe C#)
interface LoginFormProps {  // ← Interface (comme en C#)
    onLogin: (username: string, password: string) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {  // ← Classe
    const [username, setUsername] = useState('');  // ← Propriété privée
    
    const handleSubmit = () => {                   // ← Méthode
        onLogin(username, password);
    };
    
    return <form>...</form>;                       // ← Rendu HTML
}
```

### **4. State = Propriétés de classe**
```typescript
// useState = Propriété avec getter/setter automatique
const [currentPage, setCurrentPage] = useState('home');
// Équivalent C# :
// private string _currentPage = "home";
// public string CurrentPage { get; set; }
```

---

## 🚀 **COMMENT DÉMARRER**

### **1. Installer les dépendances**
```bash
cd frontend/web
npm install
```

### **2. Démarrer l'application**
```bash
npm start
```

L'app s'ouvrira sur `http://localhost:3000`

---

## 🔗 **COMMUNICATION AVEC LE BACKEND C#**

### **1. Service API (comme HttpClient)**
```typescript
// services/api.ts
class ApiService {
    async getLobbies(): Promise<Game[]> {
        return this.get<Game[]>('/api/games/lobbies');
    }
}
```

### **2. Utilisation dans un composant**
```typescript
import { apiService } from '../services/api';

function LobbyPage() {
    const [lobbies, setLobbies] = useState([]);
    
    useEffect(() => {
        // Appel API vers votre backend C#
        apiService.getLobbies().then(setLobbies);
    }, []);
}
```

---

## 📱 **PAGES DE L'APPLICATION**

### **🏠 Accueil**
- Page de bienvenue
- Bouton pour commencer une partie

### **🎯 Lobby**
- Liste des joueurs connectés
- Attente du début de partie

### **🎲 Jeu**
- Interface de jeu
- Chat en temps réel
- Système de vote

---

## 🎨 **STYLISATION**

### **CSS Modules**
- Chaque composant a son propre fichier CSS
- Styles isolés (pas de conflits)
- Design moderne avec gradients et animations

### **Responsive Design**
- S'adapte aux mobiles et tablettes
- Breakpoints CSS pour différentes tailles d'écran

---

## 🔧 **DÉVELOPPEMENT**

### **Hot Reload**
- Les changements se voient instantanément
- Pas besoin de redémarrer l'app

### **TypeScript**
- Typage fort (comme en C#)
- Autocomplétion intelligente
- Détection d'erreurs en temps réel

---

## 📚 **RESSOURCES POUR APPRENDRE**

1. **React Official Docs** : https://react.dev
2. **TypeScript Handbook** : https://www.typescriptlang.org/docs
3. **CSS Grid & Flexbox** : https://css-tricks.com

---

## 🆘 **EN CAS DE PROBLÈME**

### **Erreur commune : "Module not found"**
```bash
npm install
```

### **Erreur : "Port 3000 already in use"**
```bash
# Tuer le processus sur le port 3000
npx kill-port 3000
```

### **Reset complet**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 **PROCHAINES ÉTAPES**

1. ✅ **Frontend Web** ← VOUS ÊTES ICI
2. 📱 **Frontend Mobile** (React Native)
3. 🔌 **WebSocket** pour le temps réel
4. 🎮 **Logique de jeu** complète
5. 🚀 **Déploiement**

---

**💡 Conseil : Commencez par modifier `App.tsx` pour voir les changements en temps réel !**
