import { forwardRef, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameRoom, PlayerNumber } from '../hooks/useMultiplayerGame';
import Card from './Card';
import './CardContainer.css';

// Generate stable rotation values outside component
const generateCardRotations = () =>
  Array.from({ length: 18 }, () => Math.random() * 360);

export interface MultiplayerCardContainerRef {
  reset: () => void;
}

interface MultiplayerCardContainerProps {
  gameRoom: GameRoom;
  playerNumber: PlayerNumber;
  onCardClick: (index: number) => void;
  isResetting: boolean;
}

const MultiplayerCardContainer = forwardRef<
  MultiplayerCardContainerRef,
  MultiplayerCardContainerProps
>(({ gameRoom, playerNumber, onCardClick, isResetting }, ref) => {
  // Generate rotations only once on mount
  const [cardRotations] = useState(generateCardRotations);

  useImperativeHandle(ref, () => ({
    reset: () => {
      // Reset handled by parent through Firebase
    },
  }));

  const isMyTurn = gameRoom.currentPlayer === playerNumber;
  const canClick = isMyTurn && !isResetting && gameRoom.status === 'playing';

  return (
    <div className="card-container">
      {gameRoom.cards.map((item, i) => {
        // Calculate grid position
        const col = i % 6;
        const row = Math.floor(i / 6);

        // Calculate distance to center (grid is 6 cols x 3 rows)
        const centerCol = 2.5;
        const centerRow = 1;

        // Card width (84px) + gap (16px) = 100px
        // Card height (120px) + gap (16px) = 136px
        const xOffset = (centerCol - col) * 100;
        const yOffset = (centerRow - row) * 136;

        const isSelected =
          gameRoom.matchedIndices.split(',').map(Number).includes(i) ||
          gameRoom.firstSelectedIndex === i ||
          gameRoom.secondSelectedIndex === i;

        const isMatched = gameRoom.matchedIndices
          .split(',')
          .map(Number)
          .includes(i);
        return (
          <motion.div
            key={i}
            className="card-wrapper"
            animate={
              isResetting
                ? {
                    x: xOffset,
                    y: yOffset,
                    scale: 0.3,
                    rotateZ: cardRotations[i],
                  }
                : {
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotateZ: 0,
                  }
            }
            initial={{ x: 0, y: 0, scale: 1, rotateZ: 0 }}
            transition={{
              duration: 0.6,
              delay: isResetting ? i * 0.03 : i * 0.05,
              type: 'spring',
              stiffness: 100,
            }}
          >
            <Card
              symbol={item.symbol}
              isMatch={isMatched}
              isSelected={isSelected}
              onClickCard={() => {
                if (canClick && !isSelected) {
                  onCardClick(i);
                }
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
});

export default MultiplayerCardContainer;
