import { motion } from 'framer-motion';
import LoadingIcon from '../assets/refresh.svg';
import './Lobby.css';

interface LobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  error?: string;
  roomCode: string;
  isJoining: boolean;
  setRoomCode: (code: string) => void;
}

export default function Lobby({
  onCreateRoom,
  onJoinRoom,
  error,
  roomCode,
  isJoining,
  setRoomCode,
}: LobbyProps) {
  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      onJoinRoom();
    }
  };

  return (
    <div className="lobby-container">
      <motion.div
        className="lobby-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="lobby-title">Memory Card Game</h1>
        <p className="lobby-subtitle">Multiplayer Mode</p>

        <div className="lobby-section">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="lobby-button primary"
            onClick={onCreateRoom}
          >
            New Game
          </motion.button>
          <p className="lobby-hint">Start a new game and share the code</p>
        </div>

        <div className="lobby-divider">
          <span>OR</span>
        </div>
        <p className="lobby-hint">Enter the code shared by your friend</p>

        <div className="lobby-section">
          <input
            type="text"
            className="lobby-input"
            placeholder="code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lobby-button secondary"
            onClick={handleJoinRoom}
            disabled={roomCode.length !== 6}
          >
            {isJoining ? (
              <motion.img
                src={LoadingIcon}
                alt="Loading"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            ) : (
              'Join Game'
            )}
          </motion.button>
        </div>
        {error && <div className="lobby-error">{error}</div>}
      </motion.div>
    </div>
  );
}
