# 🐍 WendiGame - Serveur Python

## 🚀 **Serveur de jeu multijoueur avec WebSockets**

WendiGame est un serveur de jeu multijoueur moderne et léger développé en **Python** avec **FastAPI**.

## 🏗️ **Architecture simplifiée**

```
WendiGame_v2/
├── 🐍 Backend Python (FastAPI)
│   ├── main.py              # Serveur principal + WebSockets
│   ├── models.py            # Modèles de données
│   ├── services.py          # Logique métier
│   ├── controllers.py       # Routes API REST
│   ├── config.py            # Configuration simplifiée
│   └── run.py               # Script de démarrage
│
└── 📚 Documentation
    ├── README.md            # Ce fichier
    └── README_PYTHON.md     # Documentation technique
```

## 🚀 **Démarrage rapide**

### **1. Installer Python 3.8+**
```bash
python --version
```

### **2. Installer les dépendances**
```bash
pip install -r requirements.txt
```

### **3. Démarrer le serveur**
```bash
python run.py
```

### **4. Accéder à l'API**
- 🌐 **API** : http://localhost:8000
- 📚 **Documentation** : http://localhost:8000/docs

## 🎮 **Fonctionnalités**

- 🔄 **WebSockets** pour le chat en temps réel
- 🎯 **Gestion des lobbies** et des joueurs
- 💬 **Système de chat** avec historique
- 👥 **Gestion des utilisateurs** et connexions
- 📊 **API REST** complète et documentée

## 🔧 **Technologies**

- **Backend** : Python 3.8+, FastAPI, WebSockets
- **Validation** : Pydantic
- **Serveur** : Uvicorn

## 📖 **Documentation complète**

Consultez [README_PYTHON.md](README_PYTHON.md) pour la documentation technique détaillée.

---

**🎉 Serveur Python simple et efficace !**
