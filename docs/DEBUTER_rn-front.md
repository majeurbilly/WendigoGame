# 🚀 **GUIDE DE DÉMARRAGE RAPIDE - Wendigo Game**

## 🎯 **CE QUE NOUS AVONS CRÉÉ ENSEMBLE**

✅ **Frontend React** avec TypeScript  
✅ **Composants réutilisables** (LoginForm, BackendTest)  
✅ **Service API** pour communiquer avec le backend C#  
✅ **Design moderne** avec CSS responsive  
✅ **Structure claire** et organisée  

---

## 🔥 **DÉMARRER EN 3 ÉTAPES**

### **ÉTAPE 1 : Démarrer le Backend C#**
```bash
cd backend/Wendigame.API
dotnet run --launch-profile https
```
**Résultat :** Backend accessible sur `https://localhost:5001`

### **ÉTAPE 2 : Démarrer le Frontend React**
```bash
cd frontend/web
npm start
```
**Résultat :** Frontend accessible sur `http://localhost:3000`

### **ÉTAPE 3 : Tester la Communication**
1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Cliquez sur "🎲 Jeu" dans la navigation
3. Utilisez le composant "🔧 Test de Communication Backend"
4. Cliquez sur "🔌 Tester la connexion"

---

## 🎮 **CE QUE VOUS POUVEZ FAIRE MAINTENANT**

### **✅ Navigation entre pages**
- 🏠 **Accueil** : Page de bienvenue
- 🎯 **Lobby** : Liste des joueurs
- 🎲 **Jeu** : Interface de jeu + Test backend

### **✅ Test de communication**
- Test de connexion au backend C#
- Test de ping
- Affichage des réponses JSON

### **✅ Interface moderne**
- Design responsive (mobile + desktop)
- Animations et transitions
- Thème sombre avec accents bleus

---

## 🔧 **MODIFIER ET APPRENDRE**

### **1. Changer le texte d'accueil**
```typescript
// Dans App.tsx, ligne ~45
<h2>Bienvenue dans Wendigo Game !</h2>
```
**Changez en :**
```typescript
<h2>Bienvenue dans MON JEU !</h2>
```

### **2. Ajouter une nouvelle page**
```typescript
// Dans App.tsx, ajoutez un nouveau bouton
<button onClick={() => navigateTo('nouvelle-page')}>🆕 Nouvelle Page</button>

// Puis ajoutez la logique
{currentPage === 'nouvelle-page' && (
  <div className="nouvelle-page">
    <h2>Ma nouvelle page !</h2>
  </div>
)}
```

### **3. Modifier les couleurs**
```css
/* Dans App.css, changez la couleur principale */
.App-header h1 {
  color: #ff6b6b; /* Rouge au lieu de bleu */
}
```

---

## 📚 **COMPRENDRE LA STRUCTURE**

### **📁 Dossiers principaux**
```
frontend/web/
├── src/                    ← VOTRE CODE
│   ├── index.tsx          ← Point d'entrée (Main)
│   ├── App.tsx            ← Composant principal (Program.cs)
│   ├── components/        ← Composants réutilisables
│   └── services/          ← Communication API
├── public/                ← Fichiers statiques
└── package.json           ← Dépendances
```

### **🔄 Flux de données**
```
React Component → API Service → Backend C# → Database
     ↑                ↓           ↓
  Interface ← State ← Response ← JSON Data
```

---

## 🆘 **RÉSOLUTION DE PROBLÈMES**

### **❌ "Module not found"**
```bash
npm install
```

### **❌ "Port 3000 already in use"**
```bash
npx kill-port 3000
npm start
```

### **❌ Backend ne répond pas**
1. Vérifiez que le backend C# tourne sur `https://localhost:5001`
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que CORS est configuré dans le backend

### **❌ Erreur CORS**
Le backend a déjà la configuration CORS pour `http://localhost:3000`

---

## 🎯 **PROCHAINES ÉTAPES RECOMMANDÉES**

1. **✅ Familiarisez-vous** avec la navigation
2. **🔧 Testez** la communication backend
3. **🎨 Modifiez** les couleurs et textes
4. **➕ Ajoutez** une nouvelle page
5. **📱 Testez** sur mobile (responsive)
6. **🚀 Créez** de nouveaux composants

---

## 💡 **CONSEILS POUR APPRENDRE**

### **🎯 Commencez petit**
- Modifiez juste un texte
- Changez une couleur
- Ajoutez un emoji

### **🔍 Utilisez la console**
- F12 → Console pour voir les erreurs
- F12 → Network pour voir les appels API

### **📖 Lisez le code**
- Regardez comment `useState` fonctionne
- Comprenez la structure des composants
- Voyez comment l'API est appelée

---

## 🎉 **FÉLICITATIONS !**

Vous avez maintenant :
- ✅ Un frontend React fonctionnel
- ✅ Une communication avec votre backend C#
- ✅ Une structure claire et organisée
- ✅ Un design moderne et responsive

**Continuez à explorer et modifier ! Chaque changement vous aidera à comprendre React !**

---

**🚀 Prêt pour la suite ? Créons le frontend mobile ou ajoutons la logique de jeu !**
