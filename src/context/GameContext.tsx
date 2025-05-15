import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Chess, Move, Square } from 'chess.js';

interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface GameStatus {
  status: 'check' | 'checkmate' | 'draw';
  winner?: 'white' | 'black';
}

interface GameState {
  board: any[];
  fen: string;
  turn: 'w' | 'b';
  lastMove?: any;
  gameStatus?: GameStatus;
}

interface GameContextType {
  socket: Socket | null;
  chess: Chess | null;
  gameState: GameState | null;
  players: Player[];
  playerColor: 'white' | 'black' | null;
  isPlayerTurn: boolean;
  chatMessages: ChatMessage[];
  createRoom: (playerName: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
  joinRoom: (roomId: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  makeMove: (move: { from: Square; to: Square; promotion?: 'q' | 'r' | 'b' | 'n' }) => Promise<{ success: boolean; error?: string }>;
  sendMessage: (roomId: string, message: string, playerName: string) => void;
  currentRoomId: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chess, setChess] = useState<Chess | null>(new Chess());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Connect to the Socket.io server
  useEffect(() => {
    const newSocket = io('https://strategixchess-99c6.onrender.com/');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Game start event
    socket.on('gameStart', (data) => {
      setGameState({
        board: data.board,
        fen: data.fen,
        turn: data.turn,
      });
      setPlayers(data.players);
      
      // Set player color based on socket ID
      const player = data.players.find((p: Player) => p.id === socket.id);
      if (player) {
        setPlayerColor(player.color);
      }
      
      // Initialize chess.js with FEN
      const chessInstance = new Chess(data.fen);
      setChess(chessInstance);
      
      // Set chat messages
      if (data.chat) {
        setChatMessages(data.chat);
      }
    });

    // Game state update event
    socket.on('gameState', (data) => {
      setGameState(data);
      
      // Update chess.js instance
      if (chess && data.fen) {
        chess.load(data.fen);
      }
    });

    // New chat message event
    socket.on('newMessage', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Player disconnected event
    socket.on('playerDisconnected', (data) => {
      // Handle opponent disconnection
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'system',
          sender: 'System',
          text: `${data.playerName} has disconnected from the game.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      socket.off('gameStart');
      socket.off('gameState');
      socket.off('newMessage');
      socket.off('playerDisconnected');
    };
  }, [socket, chess]);

  // Create a new game room
  const createRoom = async (playerName: string): Promise<{ success: boolean; roomId?: string; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }

      socket.emit('createRoom', { playerName }, (response: any) => {
        if (response.success) {
          setCurrentRoomId(response.roomId);
        }
        resolve(response);
      });
    });
  };

  // Join an existing game room
  const joinRoom = async (roomId: string, playerName: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }

      socket.emit('joinRoom', { roomId, playerName }, (response: any) => {
        if (response.success) {
          setCurrentRoomId(roomId);
        }
        resolve(response);
      });
    });
  };

  // Make a chess move
  const makeMove = async (move: { from: Square; to: Square; promotion?: 'q' | 'r' | 'b' | 'n' }): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !currentRoomId) {
        resolve({ success: false, error: 'Not connected to a game' });
        return;
      }

      socket.emit('move', { roomId: currentRoomId, move }, (response: any) => {
        resolve(response);
      });
    });
  };

  // Send a chat message
  const sendMessage = (roomId: string, message: string, playerName: string) => {
    if (!socket) return;
    socket.emit('sendMessage', { roomId, message, playerName });
  };

  // Calculate if it's the current player's turn
  const isPlayerTurn = Boolean(
    gameState && 
    playerColor && 
    ((gameState.turn === 'w' && playerColor === 'white') || 
     (gameState.turn === 'b' && playerColor === 'black'))
  );

  const value = {
    socket,
    chess,
    gameState,
    players,
    playerColor,
    isPlayerTurn,
    chatMessages,
    createRoom,
    joinRoom,
    makeMove,
    sendMessage,
    currentRoomId,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
