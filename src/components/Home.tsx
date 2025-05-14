import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RssIcon as ChessIcon } from 'lucide-react';

interface HomeProps {
  onStartGame: (roomId: string, playerName: string) => void;
}

const Home: React.FC<HomeProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [action, setAction] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { createRoom, joinRoom } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!playerName.trim()) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }

    try {
      if (action === 'create') {
        const result = await createRoom(playerName);
        if (result.success && result.roomId) {
          onStartGame(result.roomId, playerName);
        } else {
          setError(result.error || 'Failed to create room');
        }
      } else if (action === 'join') {
        if (!roomId.trim()) {
          setError('Please enter a room ID');
          setIsLoading(false);
          return;
        }

        const result = await joinRoom(roomId, playerName);
        if (result.success) {
          onStartGame(roomId, playerName);
        } else {
          setError(result.error || 'Failed to join room');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-900 p-4 rounded-full mb-4">
              <ChessIcon size={48} className="text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-center text-white">React Chess Online</h1>
            <p className="text-gray-400 mt-2 text-center">Play chess with friends in real-time</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>

            {action === 'join' && (
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-1">
                  Room ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room ID"
                  required
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {action ? (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : action === 'create' ? 'Create Game' : 'Join Game'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAction('create')}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                  >
                    Create New Game
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('join')}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                  >
                    Join Game
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;