import React, { useState } from 'react';
import { Button, Card, Modal } from './components/common';
import { PhaseIndicator, PlayerCard, ChairSelector } from './components/game';
import { useGameState } from './hooks/useGameState';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showChairSelector, setShowChairSelector] = useState(false);
  
  const {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    selectChair,
    addPlayer
  } = useGameState();

  // Exemple de données pour démontrer les composants
  const samplePlayers = [
    { id: '1', name: 'Alice', role: 'Villageois', team: 'village' as const, isAlive: true },
    { id: '2', name: 'Bob', role: 'Loup', team: 'wolf' as const, isAlive: true },
    { id: '3', name: 'Charlie', role: 'Médium', team: 'special' as const, isAlive: false }
  ];

  const sampleChairs = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    isOccupied: i < 3,
    occupiedBy: i < 3 ? `Joueur ${i + 1}` : undefined,
    isSelectable: i >= 3,
    isSelected: i === 3
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🐺 Wendigo Game - Composants Réutilisables
        </h1>

        {/* Démonstration des composants communs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" className="text-center">
            <h3 className="text-lg font-semibold mb-4">Composants Communs</h3>
            <div className="space-y-3">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Ouvrir Modal
              </Button>
              <Button variant="secondary" onClick={startGame}>
                Démarrer Jeu
              </Button>
              <Button variant="danger" onClick={pauseGame}>
                Pause
              </Button>
              <Button variant="success" onClick={resumeGame}>
                Reprendre
              </Button>
            </div>
          </Card>

          {/* Démonstration PhaseIndicator */}
          <Card variant="elevated">
            <h3 className="text-lg font-semibold mb-4">Indicateur de Phase</h3>
            <PhaseIndicator
              phase={gameState.phase}
              timeRemaining={gameState.timeRemaining}
              totalTime={gameState.totalTime}
            />
          </Card>

          {/* Démonstration PlayerCard */}
          <Card variant="elevated">
            <h3 className="text-lg font-semibold mb-4">Cartes Joueurs</h3>
            <div className="space-y-2">
              {samplePlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  showRole={true}
                  showVoteCount={true}
                  voteCount={Math.floor(Math.random() * 3)}
                  onClick={() => console.log(`Clicked on ${player.name}`)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Démonstration ChairSelector */}
        <Card variant="elevated" className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Sélecteur de Chaises</h3>
            <Button 
              variant="ghost" 
              onClick={() => setShowChairSelector(!showChairSelector)}
            >
              {showChairSelector ? 'Masquer' : 'Afficher'} Sélecteur
            </Button>
          </div>
          
          {showChairSelector && (
            <ChairSelector
              chairs={sampleChairs}
              maxPlayers={8}
              onChairSelect={(chairId) => {
                console.log(`Selected chair ${chairId}`);
                selectChair(chairId);
              }}
            />
          )}
        </Card>

        {/* Modal de démonstration */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Démonstration Modal"
          size="lg"
        >
          <div className="space-y-4">
            <p>Ceci est une démonstration du composant Modal réutilisable.</p>
            <p>Il peut être utilisé pour :</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Confirmer des actions</li>
              <li>Afficher des règles</li>
              <li>Montrer des détails</li>
              <li>Créer des formulaires</li>
            </ul>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Confirmer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;