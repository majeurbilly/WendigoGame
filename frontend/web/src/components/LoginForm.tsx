import React, { useState } from 'react';
import './LoginForm.css';

// Interface pour les props (comme des paramètres de méthode en C#)
interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onRegister: () => void;
  isLoading?: boolean;
}

// Composant de connexion (comme une classe en C#)
function LoginForm({ onLogin, onRegister, isLoading = false }: LoginFormProps) {
  // State local (comme des propriétés privées en C#)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Gestionnaire de soumission (comme une méthode en C#)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username, password);
    }
  };

  // Rendu du composant (comme le HTML de votre app)
  return (
    <div className="login-form-container">
      <div className="login-form">
        <h2>🔐 Connexion</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? '⏳ Connexion...' : '🚀 Se connecter'}
          </button>
        </form>

        <div className="form-footer">
          <p>Pas encore de compte ?</p>
          <button
            type="button"
            className="register-link"
            onClick={onRegister}
            disabled={isLoading}
          >
            📝 Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
