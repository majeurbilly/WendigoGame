import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Composant de la page d'accueil
function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Wendigo Game</h1>
        <p>Jeu de loup-garou hybride physique-numérique</p>
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{ 
              padding: '10px 20px', 
              margin: '0 10px', 
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/login'}
          >
            Se connecter
          </button>
          <button 
            style={{ 
              padding: '10px 20px', 
              margin: '0 10px', 
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/register'}
          >
            S'inscrire
          </button>
        </div>
      </header>
    </div>
  );
}

// Composant de la page de connexion
function Login() {
  const [formData, setFormData] = React.useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Connexion réussie !');
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        console.log('Erreur API:', errorData);
        
        // Gestion des différents types d'erreurs
        let errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Erreurs de validation
            errorMessage = errorData.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg || err;
            }).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        alert(`Erreur de connexion: ${errorMessage}`);
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Connexion - Wendigo Game</h1>
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          maxWidth: '400px',
          width: '100%',
          padding: '20px'
        }}>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: loading ? '#666' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retour
            </button>
          </div>
        </form>
      </header>
    </div>
  );
}

// Composant de la page d'inscription
function Register() {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        })
      });

      if (response.ok) {
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        console.log('Erreur API:', errorData);
        
        // Gestion des différents types d'erreurs
        let errorMessage = 'Erreur lors de l\'inscription';
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Erreurs de validation
            errorMessage = errorData.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg || err;
            }).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        alert(`Erreur d'inscription: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Inscription - Wendigo Game</h1>
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          maxWidth: '400px',
          width: '100%',
          padding: '20px'
        }}>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe (minimum 8 caractères)"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: loading ? '#666' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retour
            </button>
          </div>
        </form>
      </header>
    </div>
  );
}

// Composant Dashboard simple
function Dashboard() {
  const [user, setUser] = React.useState(null);
  const [games, setGames] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [createFormData, setCreateFormData] = React.useState({
    name: '',
    min_players: 8,
    max_players: 12
  });

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    setUser(JSON.parse(userData));
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/games/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    console.log('Création de partie...');
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Présent' : 'Absent');
      
      const response = await fetch('http://localhost:8000/api/v1/games/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createFormData.name || `Partie de ${user?.username}`,
          min_players: createFormData.min_players,
          max_players: createFormData.max_players
        })
      });

      console.log('Réponse du serveur:', response.status);
      
              if (response.ok) {
          const newGame = await response.json();
          console.log('Partie créée:', newGame);
          alert(`Partie créée avec succès ! ID: ${newGame.id}`);
          setShowCreateForm(false);
          setCreateFormData({ name: '', min_players: 8, max_players: 12 });
          loadGames();
        } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        
        // Gestion des différents types d'erreurs
        let errorMessage = 'Erreur lors de la création de la partie';
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Erreurs de validation
            errorMessage = errorData.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg || err;
            }).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Si c'est le message de lobby existant, afficher un message amusant
        if (errorMessage.includes("Impossible de créer un nouveau lobby")) {
          alert("🚫 Impossible de créer un nouveau lobby - Il y en a déjà un en cours ! 🎮");
        } else {
          alert(`Erreur lors de la création: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: name === 'min_players' || name === 'max_players' ? parseInt(value) : value
    }));
  };

  const validateForm = () => {
    if (createFormData.min_players < 8) {
      alert('Le nombre minimum de joueurs doit être au moins 8');
      return false;
    }
    if (createFormData.max_players > 29) {
      alert('Le nombre maximum de joueurs ne peut pas dépasser 29');
      return false;
    }
    if (createFormData.min_players > createFormData.max_players) {
      alert('Le nombre minimum de joueurs ne peut pas dépasser le maximum');
      return false;
    }
    return true;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await createGame();
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Chargement...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard - Wendigo Game</h1>
        <p>Bienvenue, {user?.username} !</p>
        
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          {!showCreateForm ? (
            <button 
              onClick={() => setShowCreateForm(true)}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Créer une partie
            </button>
          ) : (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #444',
              marginBottom: '20px',
              maxWidth: '400px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#4CAF50' }}>Créer une nouvelle partie</h3>
              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom de la partie (optionnel)"
                  value={createFormData.name}
                  onChange={handleCreateFormChange}
                  style={{
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '5px',
                    border: '1px solid #444',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#e0e0e0', fontSize: '14px', marginBottom: '5px', display: 'block' }}>
                      Joueurs min:
                    </label>
                    <input
                      type="number"
                      name="min_players"
                      min="8"
                      max="29"
                      value={createFormData.min_players}
                      onChange={handleCreateFormChange}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #444',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        width: '100%'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#e0e0e0', fontSize: '14px', marginBottom: '5px', display: 'block' }}>
                      Joueurs max:
                    </label>
                    <input
                      type="number"
                      name="max_players"
                      min="8"
                      max="29"
                      value={createFormData.max_players}
                      onChange={handleCreateFormChange}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #444',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        width: '100%'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="submit"
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Créer
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateFormData({ name: '', min_players: 8, max_players: 12 });
                    }}
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '16px',
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
          <button 
            onClick={logout}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Se déconnecter
          </button>
        </div>

        <div style={{ maxWidth: '600px', width: '100%' }}>
          <h2>Parties disponibles</h2>
          {games.length === 0 ? (
            <p>Aucune partie disponible</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {games.map(game => (
                                 <div key={game.id} style={{
                   padding: '15px',
                   border: '2px solid #444',
                   borderRadius: '8px',
                   backgroundColor: '#2a2a2a',
                   color: '#ffffff',
                   marginBottom: '15px',
                   boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                 }}>
                   <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>{game.name}</h3>
                   <p style={{ margin: '5px 0', color: '#e0e0e0' }}>Joueurs: {game.current_players}/{game.max_players}</p>
                   <p style={{ margin: '5px 0', color: '#e0e0e0' }}>Statut: {game.status}</p>
                   <button 
                     onClick={() => alert(`Rejoindre la partie ${game.id} - Fonctionnalité en cours de développement`)}
                     style={{ 
                       padding: '8px 16px', 
                       fontSize: '14px',
                       backgroundColor: '#2196F3',
                       color: 'white',
                       border: 'none',
                       borderRadius: '5px',
                       cursor: 'pointer',
                       marginTop: '10px',
                       transition: 'background-color 0.3s'
                     }}
                     onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
                     onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
                   >
                     Rejoindre
                   </button>
                 </div>
              ))}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
