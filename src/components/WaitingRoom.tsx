import { motion } from 'framer-motion';
import './WaitingRoom.css';

interface WaitingRoomProps {
  roomCode: string;
  onCancel: () => void;
}

export default function WaitingRoom({ roomCode, onCancel }: WaitingRoomProps) {
  return (
    <div className="waiting-container">
      <motion.div
        className="waiting-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="waiting-title">Waiting for Player 2...</h2>

        <div className="room-code-display">
          <p className="room-code-label">Share this code:</p>
          <motion.div className="room-code">{roomCode}</motion.div>
        </div>

        <div className="waiting-dots">
          <motion.div
            className="dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}
