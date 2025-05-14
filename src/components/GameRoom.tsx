import React, { useEffect, useState } from 'react';
import ChessboardComponent from './ChessboardComponent';
import GameInfo from './GameInfo';
import Chat from './Chat';
import { useGame } from '../context/GameContext';
import { ArrowLeftIcon } from 'lucide-react';

interface GameRoomProps {
  roomId: string;
  playerName: string;
  onReturnToHome: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({ roomId, playerName, onReturnToHome }) => {
  const { 
    gameState, 
    players, 
    playerColor,
    chatMessages, 
    sendMessage 
  } = useGame();
  
  const [copied, setCopied] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle chat message sending
  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      sendMessage(roomId, message, playerName);
    }
  };

  // Get opponent information
  const opponent = players.find(p => p.color !== playerColor);
  const opponentName = opponent?.name || 'Waiting for opponent...';

  // Determine if the game has started (both players joined)
  const gameStarted = players.length === 2;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <button 
          onClick={onReturnToHome}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon size={18} className="mr-1" />
          <span>Exit</span>
        </button>
        
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-white">Room: {roomId}</h2>
          <button 
            onClick={copyRoomId}
            className="ml-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="md:hidden">
          <button 
            onClick={() => setShowMobileChat(!showMobileChat)}
            className="px-3 py-2 bg-blue-700 rounded-md text-sm font-medium"
          >
            {showMobileChat ? 'Show Board' : 'Chat'}
          </button>
        </div>
      </header>

      {/* Main content - Responsive layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Chess board and game info - Hide on mobile when chat is shown */}
        <div className={`flex-1 p-4 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Show waiting message if opponent hasn't joined yet */}
            {!gameStarted && (
              <div className="absolute z-10 bg-black/70 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-3">Waiting for opponent</h3>
                <p className="text-gray-300 mb-4">Share the room ID with a friend to start playing</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono bg-gray-800 px-3 py-1 rounded">{roomId}</span>
                  <button 
                    onClick={copyRoomId}
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Chessboard component */}
            <ChessboardComponent />
            
            {/* Game info */}
            <GameInfo 
              playerName={playerName} 
              opponentName={opponentName} 
              playerColor={playerColor} 
            />
          </div>
        </div>
        
        {/* Chat - Hide on mobile when board is shown */}
        <div className={`w-full md:w-80 bg-gray-800 ${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col`}>
          <Chat 
            messages={chatMessages} 
            onSendMessage={handleSendMessage} 
            playerName={playerName}
          />
        </div>
      </div>
    </div>
  );
};

export default GameRoom;