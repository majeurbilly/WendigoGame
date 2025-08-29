import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🐺 <span className="title-highlight">Wendigo Game</span>
          </h1>
          <p className="hero-subtitle">
            Le jeu de loup-garou hybride présentiel-numérique le plus immersif
          </p>
          <p className="hero-description">
            Rejoignez 8 à 29 joueurs dans une pièce et utilisez la technologie 
            pour vivre une expérience de jeu sociale unique. Chaque joueur a des 
            pouvoirs spéciaux dans cette version évoluée du classique.
          </p>
          
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="cta-button primary">
                🎮 Aller au Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  🚀 Commencer à jouer
                </Link>
                <Link to="/login" className="cta-button secondary">
                  🔐 Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="game-preview">
            <div className="preview-circle">
              <div className="player-token preview-player">
                <span>👤</span>
                <small>Joueur</small>
              </div>
              <div className="player-token preview-wolf">
                <span>🐺</span>
                <small>Loup</small>
              </div>
              <div className="player-token preview-villager">
                <span>🛡️</span>
                <small>Villageois</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">🌟 Pourquoi Wendigo Game ?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎭</div>
            <h3>29 Rôles Uniques</h3>
            <p>Chaque joueur a des pouvoirs distincts. Pas de villageois passifs !</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Hybride Présentiel-Numérique</h3>
            <p>La richesse sociale du jeu de table avec la précision du numérique</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Gestion Automatique</h3>
            <p>Phases, timers et résolution des pouvoirs gérés automatiquement</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Stratégie Avancée</h3>
            <p>Communication et coordination essentielles pour la victoire</p>
          </div>
        </div>
      </div>

      {/* How to Play Section */}
      <div className="how-to-play-section">
        <h2 className="section-title">📖 Comment jouer ?</h2>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Créez ou rejoignez une partie</h3>
              <p>Rassemblez 8 à 29 joueurs dans la même pièce physique</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Choisissez votre position</h3>
              <p>Sélectionnez une chaise et préparez-vous pour l'aventure</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Découvrez votre rôle</h3>
              <p>Apprenez vos pouvoirs et votre équipe (Loups vs Villageois)</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Jouez et survivez</h3>
              <p>Utilisez vos pouvoirs stratégiquement pour gagner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="game-modes-section">
        <h2 className="section-title">🎮 Modes de jeu</h2>
        
        <div className="modes-grid">
          <div className="mode-card">
            <div className="mode-header">
              <h3>🌙 Phase Nocturne</h3>
              <span className="mode-badge">Nuit</span>
            </div>
            <p>Les loups votent pour tuer, les villageois utilisent leurs pouvoirs</p>
            <ul className="mode-features">
              <li>Vote secret des loups</li>
              <li>Activation des pouvoirs</li>
              <li>Chat désactivé (sauf rôles spéciaux)</li>
            </ul>
          </div>
          
          <div className="mode-card">
            <div className="mode-header">
              <h3>☀️ Phase Diurne</h3>
              <span className="mode-badge">Jour</span>
            </div>
            <p>Discussion, accusations et stratégie en équipe</p>
            <ul className="mode-features">
              <li>Discussion libre</li>
              <li>Accusations et défense</li>
              <li>Planification des actions</li>
            </ul>
          </div>
          
          <div className="mode-card">
            <div className="mode-header">
              <h3>🗳️ Phase de Vote</h3>
              <span className="mode-badge">Vote</span>
            </div>
            <p>Vote démocratique pour éliminer un suspect</p>
            <ul className="mode-features">
              <li>Vote à la majorité</li>
              <li>Révélation des résultats</li>
              <li>Exécution immédiate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2>🎯 Prêt à jouer ?</h2>
        <p>Rejoignez la communauté Wendigo Game et vivez une expérience unique</p>
        
        <div className="cta-actions">
          {user ? (
            <Link to="/dashboard" className="cta-button primary large">
              🎮 Commencer une partie
            </Link>
          ) : (
            <>
              <Link to="/register" className="cta-button primary large">
                🚀 Créer un compte
              </Link>
              <Link to="/login" className="cta-button secondary large">
                🔐 Se connecter
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 Wendigo Game - Jeu de loup-garou hybride</p>
        <p>Développé avec ❤️ pour les passionnés de jeux sociaux</p>
      </footer>
    </div>
  );
};

export default Home;
