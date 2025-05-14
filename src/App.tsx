import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Home from './components/Home';
import GameRoom from './components/GameRoom';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  const startGame = (roomId: string, name: string) => {
    setRoomId(roomId);
    setPlayerName(name);
    setCurrentScreen('game');
  };

  const returnToHome = () => {
    setCurrentScreen('home');
    setRoomId(null);
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        {currentScreen === 'home' ? (
          <Home onStartGame={startGame} />
        ) : (
          <GameRoom 
            roomId={roomId!} 
            playerName={playerName} 
            onReturnToHome={returnToHome} 
          />
        )}
      </div>
    </GameProvider>
  );
}

export default App;