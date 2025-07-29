import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            const result = await response.json();
            if (response.ok) {
                // Stocker le joueur dans localStorage ou Context
                localStorage.setItem('joueur', JSON.stringify(result));
                navigate('/lobby'); // Redirige vers la page du lobby
            } else {
                setError(result.message || 'Erreur de connexion');
            }
        } catch (err) {
            setError('Impossible de contacter le serveur');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label>Nom d'utilisateur</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary">Se connecter</button>
            </form>
        </div>
    );
}

export default LoginPage;
