import React, { useState } from 'react';
import './App.css';
import BackendTest from './components/BackendTest';

// C'est votre composant principal !
// Comme Program.cs en C#, c'est ici que tout commence
function App() {
  // State = données de votre app (comme des propriétés de classe en C#)
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fonction pour changer de page (comme une méthode en C#)
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  // Rendu de l'interface (comme le HTML de votre app)
  return (
    <div className="App">
      {/* Header - Navigation */}
      <header className="App-header">
        <h1>🎮 Wendigo Game</h1>
        <nav>
          <button onClick={() => navigateTo('home')}>🏠 Accueil</button>
          <button onClick={() => navigateTo('lobby')}>🎯 Lobby</button>
          <button onClick={() => navigateTo('game')}>🎲 Jeu</button>
          {!isLoggedIn ? (
            <button onClick={() => setIsLoggedIn(true)}>🔐 Connexion</button>
          ) : (
            <button onClick={() => setIsLoggedIn(false)}>🚪 Déconnexion</button>
          )}
        </nav>
      </header>

      {/* Contenu principal - Change selon la page */}
      <main className="App-main">
        {currentPage === 'home' && (
          <div className="home-page">
            <h2>Bienvenue dans Wendigo Game !</h2>
            <p>Un jeu de société mystérieux et passionnant</p>
            <button onClick={() => navigateTo('lobby')}>
              🚀 Commencer une partie
            </button>
          </div>
        )}

        {currentPage === 'lobby' && (
          <div className="lobby-page">
            <h2>🎯 Lobby de jeu</h2>
            <p>En attente de joueurs...</p>
            <div className="player-list">
              <h3>Joueurs connectés:</h3>
              <ul>
                <li>👤 Joueur 1 (Prêt)</li>
                <li>👤 Joueur 2 (Prêt)</li>
                <li>⏳ En attente...</li>
              </ul>
            </div>
          </div>
        )}

        {currentPage === 'game' && (
          <div className="game-page">
            <h2>🎲 Partie en cours</h2>
            <p>Phase: Discussion</p>
            <div className="game-area">
              <div className="chat-area">
                <h3>💬 Chat de jeu</h3>
                <div className="chat-messages">
                  <p><strong>Joueur 1:</strong> Salut tout le monde !</p>
                  <p><strong>Joueur 2:</strong> Bonjour !</p>
                </div>
                <input type="text" placeholder="Tapez votre message..." />
              </div>
            </div>
          </div>
        )}

        {/* Composant de test backend */}
        <BackendTest />
      </main>
    </div>
  );
}

export default App;
