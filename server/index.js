import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Chess } from 'chess.js';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add basic route handler
app.get('/', (req, res) => {
  res.json({ message: 'Chess game server is running' });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// Store active game rooms
const gameRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new game room
  socket.on('createRoom', ({ playerName }, callback) => {
    try {
      const roomId = nanoid(6);
      const chess = new Chess();
      
      // Store game state
      gameRooms.set(roomId, {
        roomId,
        players: [{
          id: socket.id,
          name: playerName,
          color: 'white',
        }],
        game: chess,
        chat: [],
      });

      socket.join(roomId);
      callback({ success: true, roomId });
      console.log(`Room created: ${roomId}, Player: ${playerName} (${socket.id})`);
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Join an existing game room
  socket.on('joinRoom', ({ roomId, playerName }, callback) => {
    try {
      const room = gameRooms.get(roomId);
      
      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }
      
      if (room.players.length >= 2) {
        return callback({ success: false, error: 'Room is full' });
      }

      // Add second player
      room.players.push({
        id: socket.id,
        name: playerName,
        color: 'black',
      });

      socket.join(roomId);

      // Notify both players about game start
      const gameState = {
        board: room.game.board(),
        fen: room.game.fen(),
        players: room.players,
        chat: room.chat,
        turn: room.game.turn(),
      };

      io.to(roomId).emit('gameStart', gameState);
      
      callback({ success: true, roomId, gameState });
      console.log(`Player ${playerName} (${socket.id}) joined room: ${roomId}`);
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle a chess move
  socket.on('move', ({ roomId, move }, callback) => {
    try {
      const room = gameRooms.get(roomId);
      
      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }

      // Verify it's the player's turn
      const player = room.players.find(p => p.id === socket.id);
      if (!player) {
        return callback({ success: false, error: 'Player not found in this room' });
      }

      const playerColor = player.color.charAt(0);
      if (room.game.turn() !== playerColor.charAt(0).toLowerCase()) {
        return callback({ success: false, error: 'Not your turn' });
      }

      // Try to make the move
      const result = room.game.move(move);
      if (!result) {
        return callback({ success: false, error: 'Invalid move' });
      }

      // Check game status
      let gameStatus = null;
      if (room.game.isCheckmate()) {
        gameStatus = { status: 'checkmate', winner: player.color };
      } else if (room.game.isDraw()) {
        gameStatus = { status: 'draw' };
      } else if (room.game.isCheck()) {
        gameStatus = { status: 'check' };
      }

      // Send updated game state to all players in the room
      const gameState = {
        board: room.game.board(),
        fen: room.game.fen(),
        turn: room.game.turn(),
        lastMove: move,
        gameStatus,
      };

      io.to(roomId).emit('gameState', gameState);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handle chat messages
  socket.on('sendMessage', ({ roomId, message, playerName }) => {
    const room = gameRooms.get(roomId);
    if (!room) return;

    const chatMessage = {
      id: nanoid(),
      sender: playerName,
      text: message,
      timestamp: new Date().toISOString(),
    };

    room.chat.push(chatMessage);
    io.to(roomId).emit('newMessage', chatMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and clean up any game rooms the player was in
    for (const [roomId, room] of gameRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Notify other player about disconnection
        socket.to(roomId).emit('playerDisconnected', {
          playerId: socket.id,
          playerName: room.players[playerIndex].name,
        });
        
        // Remove the room if it was in the setup phase
        if (room.players.length <= 1) {
          gameRooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        }
        
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});