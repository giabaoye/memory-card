import { motion } from 'framer-motion';
import LoadingIcon from './assets/refresh.svg';
import PlayerInformation from './components/PlayerInformation';
import './GameControl.css';

export default function GameControl({
  isFirstPlayerTurn,
  score,
  handleReset,
  shuffleDone,
}: {
  isFirstPlayerTurn: boolean;
  score: {
    playerOne: number;
    playerTwo: number;
  };
  handleReset: () => void;
  shuffleDone: boolean;
}) {
  return (
    <div className="bg-blue-navy border-secondary m-4 rounded-4xl border-8">
      <PlayerInformation isPlayerOneTurn={isFirstPlayerTurn} score={score} />

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`reset-button text-primary bg-secondary mt-8 min-w-40.5 rounded-lg border-none px-8 py-3 text-[1.1rem] font-semibold transition-colors duration-200 ${shuffleDone ? 'cursor-not-allowed opacity-60' : ''}`}
        onClick={handleReset}
        disabled={shuffleDone}
      >
        {shuffleDone ? (
          <motion.img
            src={LoadingIcon}
            alt="Loading"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        ) : (
          'Reset game'
        )}
      </motion.button>
    </div>
  );
}
