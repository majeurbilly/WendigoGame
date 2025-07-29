import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function CreateProfilPage() {
    const [prenom, setPrenom] = useState('');
    const [avatar, setAvatar] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/joueur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prenom, avatar }),
            });

            const result = await res.json();
            if (res.ok) {
                setUser(result); // stocker dans le contexte
                localStorage.setItem('joueur', JSON.stringify(result));
                navigate('/lobby');
            } else {
                setError(result.message || 'Erreur lors de la création du profil');
            }
        } catch (err) {
            setError('Impossible de contacter le serveur');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Créer mon profil</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Prénom</label>
                    <input
                        type="text"
                        className="form-control"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Avatar (URL ou emoji)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-success">Créer le profil</button>
            </form>
        </div>
    );
}

export default CreateProfilPage;
