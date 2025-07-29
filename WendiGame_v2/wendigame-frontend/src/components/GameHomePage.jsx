// GameHomePage.jsx
import React from 'react';

const games = [
    { id: 1, title: 'Quête des Éléments', description: 'Explore les quatre royaumes.' },
    { id: 2, title: 'Chrono-Rush', description: 'Maîtrise le temps dans cette course effrénée.' },
    { id: 3, title: 'Pixel Arena', description: 'Combat en arène 1v1.' }
];

const GameHomePage = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Accueil des Jeux</h1>
            <ul>
                {games.map(game => (
                    <li key={game.id} style={{ marginBottom: '10px' }}>
                        <h2>{game.title}</h2>
                        <p>{game.description}</p>
                        <button>Jouer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GameHomePage;
