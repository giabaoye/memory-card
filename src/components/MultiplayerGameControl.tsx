import { motion } from 'framer-motion';
import type { GameRoom, PlayerNumber } from '../hooks/useMultiplayerGame';
import './MultiplayerGameControl.css';

interface MultiplayerGameControlProps {
  gameRoom: GameRoom;
  playerNumber: PlayerNumber;
  onReset: () => void;
  onLeave: () => void;
  isResetting: boolean;
}

export default function MultiplayerGameControl({
  gameRoom,
  playerNumber,
  onReset,
  onLeave,
  isResetting,
}: MultiplayerGameControlProps) {
  const isMyTurn = gameRoom.currentPlayer === playerNumber;
  const myScore =
    playerNumber === 1 ? gameRoom.scores.player1 : gameRoom.scores.player2;
  const opponentScore =
    playerNumber === 1 ? gameRoom.scores.player2 : gameRoom.scores.player1;
  const opponentName =
    playerNumber === 1
      ? gameRoom.players.player2?.name
      : gameRoom.players.player1?.name;
  const opponentConnected =
    playerNumber === 1
      ? gameRoom.players.player2?.connected
      : gameRoom.players.player1?.connected;

  return (
    <div className="multiplayer-control">
      <div className="game-info">
        <div className="room-code-badge">Room: {gameRoom.roomCode}</div>

        <div className="players-info">
          <div className={`player-card ${isMyTurn ? 'active' : ''}`}>
            <div className="player-label">You (Player {playerNumber})</div>
            <div className="player-score">{myScore}</div>
            {isMyTurn && <div className="turn-indicator">Your Turn</div>}
          </div>

          <div className={`player-card ${!isMyTurn ? 'active' : ''}`}>
            <div className="player-label">
              {opponentName || `Player ${playerNumber === 1 ? 2 : 1}`}
            </div>
            <div className="player-score">{opponentScore}</div>
            {!isMyTurn && <div className="turn-indicator">Their Turn</div>}
            {!opponentConnected && (
              <div className="disconnected-badge">Disconnected</div>
            )}
          </div>
        </div>
      </div>

      <div className="game-actions">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="action-button reset"
          onClick={onReset}
          disabled={isResetting}
        >
          Reset Game
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="action-button leave"
          onClick={onLeave}
        >
          Leave Room
        </motion.button>
      </div>
    </div>
  );
}
