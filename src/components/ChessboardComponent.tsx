import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useGame } from '../context/GameContext';

const ChessboardComponent: React.FC = () => {
  const { 
    chess, 
    gameState, 
    playerColor, 
    isPlayerTurn, 
    makeMove 
  } = useGame();
  
  const [boardWidth, setBoardWidth] = useState(480);
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);

  // Responsive board sizing
  useEffect(() => {
    const handleResize = () => {
      const gameArea = document.getElementById('game-area');
      if (gameArea) {
        const width = Math.min(gameArea.offsetWidth - 40, 600);
        setBoardWidth(width);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle piece drop
  const onDrop = async (sourceSquare: Square, targetSquare: Square) => {
    if (!chess || !isPlayerTurn) return false;

    // Check if the move is legal
    try {
      const moveResult = await makeMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      });

      return moveResult.success;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  };

  // Handle piece drag-over
  const onPieceDragBegin = (piece: string, sourceSquare: Square) => {
    if (!isPlayerTurn) return;
    setSelectedPiece(sourceSquare);
  };

  // Handle piece drag end
  const onPieceDragEnd = () => {
    setSelectedPiece(null);
  };

  // Get the current board position
  const position = gameState?.fen || 'start';

  // Define custom pieces (optional)
  const customPieces = () => {
    return {};
  };

  // Style for the last move
  const customSquareStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};
    
    // Highlight the last move
    if (gameState?.lastMove) {
      const { from, to } = gameState.lastMove;
      
      styles[from] = {
        backgroundColor: 'rgba(255, 208, 0, 0.3)',
      };
      
      styles[to] = {
        backgroundColor: 'rgba(255, 208, 0, 0.3)',
      };
    }
    
    // Highlight king in check
    if (gameState?.gameStatus?.status === 'check' && chess) {
      const turn = chess.turn();
      const kingSquare = chess.board().flat().find(
        square => square && square.type === 'k' && square.color === turn
      );
      
      if (kingSquare && kingSquare.square) {
        styles[kingSquare.square] = {
          backgroundColor: 'rgba(255, 0, 0, 0.4)',
        };
      }
    }
    
    return styles;
  };

  return (
    <div id="game-area" className="w-full max-w-[600px] aspect-square relative mb-4">
      <Chessboard
        id="chessboard"
        boardWidth={boardWidth}
        position={position}
        onPieceDrop={onDrop}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDragEnd={onPieceDragEnd}
        boardOrientation={playerColor === 'black' ? 'black' : 'white'}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        customPieces={customPieces()}
        customSquareStyles={customSquareStyles()}
        areArrowsAllowed={true}
      />
    </div>
  );
};

export default ChessboardComponent;