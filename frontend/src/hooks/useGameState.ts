import { useState, useEffect, useCallback } from 'react';

export interface GameState {
  phase: 'day' | 'night';
  timeRemaining: number;
  totalTime: number;
  players: Player[];
  currentPlayer: Player | null;
  selectedChair: number | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
}

export interface Player {
  id: string;
  name: string;
  role?: string;
  team?: 'village' | 'wolf' | 'special';
  isAlive: boolean;
  chairId?: number;
  isOnTrial?: boolean;
}

export const useGameState = (initialState?: Partial<GameState>) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'day',
    timeRemaining: 600, // 10 minutes
    totalTime: 600,
    players: [],
    currentPlayer: null,
    selectedChair: null,
    gameStatus: 'waiting',
    ...initialState
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, gameState.timeRemaining]);

  // Auto-switch phase when timer reaches 0
  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.gameStatus === 'playing') {
      const newPhase = gameState.phase === 'day' ? 'night' : 'day';
      const newTime = newPhase === 'day' ? 600 : 30; // 10 min day, 30s night
      
      setGameState(prev => ({
        ...prev,
        phase: newPhase,
        timeRemaining: newTime,
        totalTime: newTime
      }));
    }
  }, [gameState.timeRemaining, gameState.phase, gameState.gameStatus]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      timeRemaining: 600,
      totalTime: 600
    }));
    setIsTimerRunning(true);
  }, []);

  const pauseGame = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resumeGame = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const selectChair = useCallback((chairId: number) => {
    setGameState(prev => ({
      ...prev,
      selectedChair: chairId
    }));
  }, []);

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      )
    }));
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, player]
    }));
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(player => player.id !== playerId)
    }));
  }, []);

  const setPhase = useCallback((phase: 'day' | 'night', duration?: number) => {
    const newTime = duration || (phase === 'day' ? 600 : 30);
    setGameState(prev => ({
      ...prev,
      phase,
      timeRemaining: newTime,
      totalTime: newTime
    }));
  }, []);

  return {
    gameState,
    isTimerRunning,
    startGame,
    pauseGame,
    resumeGame,
    selectChair,
    updatePlayer,
    addPlayer,
    removePlayer,
    setPhase
  };
};
