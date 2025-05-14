import React from 'react';
import { useGame } from '../context/GameContext';
import { Clock, TrophyIcon } from 'lucide-react';

interface GameInfoProps {
  playerName: string;
  opponentName: string;
  playerColor: 'white' | 'black' | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ playerName, opponentName, playerColor }) => {
  const { gameState, isPlayerTurn } = useGame();

  const getTurnIndicator = () => {
    if (!gameState || !playerColor) return null;
    
    return (
      <div className="flex items-center justify-center mb-4">
        <div className={`px-4 py-2 rounded-full ${isPlayerTurn 
          ? 'bg-green-700 text-white' 
          : 'bg-gray-700 text-gray-300'}`}
        >
          {isPlayerTurn ? 'Your turn' : `${opponentName}'s turn`}
        </div>
      </div>
    );
  };

  const getGameStatus = () => {
    if (!gameState?.gameStatus) return null;
    
    const { status, winner } = gameState.gameStatus;
    
    if (status === 'checkmate') {
      const isWinner = playerColor === winner;
      return (
        <div className={`text-center p-4 rounded-lg ${isWinner ? 'bg-green-700/70' : 'bg-red-700/70'}`}>
          <TrophyIcon className={`mx-auto mb-2 ${isWinner ? 'text-yellow-400' : 'text-gray-400'}`} size={28} />
          <h3 className="text-xl font-bold mb-1">
            {isWinner ? 'You won!' : 'You lost!'}
          </h3>
          <p>Checkmate</p>
        </div>
      );
    }
    
    if (status === 'draw') {
      return (
        <div className="text-center p-4 rounded-lg bg-blue-700/70">
          <h3 className="text-xl font-bold mb-1">Game drawn</h3>
          <p>The game ended in a draw</p>
        </div>
      );
    }
    
    if (status === 'check') {
      const inCheck = (gameState.turn === 'w' && playerColor === 'white') || 
                     (gameState.turn === 'b' && playerColor === 'black');
      if (inCheck) {
        return (
          <div className="text-center p-2 rounded-lg bg-red-700/50">
            <p className="font-bold">Your king is in check!</p>
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-[600px] bg-gray-800 rounded-lg p-4 mb-4">
      {/* Game status notification */}
      {getGameStatus()}
      
      {/* Turn indicator */}
      {!gameState?.gameStatus?.winner && !gameState?.gameStatus?.status === 'draw' && getTurnIndicator()}
      
      {/* Player information */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${playerColor === 'white' ? 'bg-white' : 'bg-black border border-gray-600'} mr-2`}></div>
          <span className="font-medium">{playerName} (You)</span>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium">{opponentName}</span>
          <div className={`w-4 h-4 rounded-full ${playerColor === 'black' ? 'bg-white' : 'bg-black border border-gray-600'} ml-2`}></div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;