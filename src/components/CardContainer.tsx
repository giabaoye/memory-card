import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';
import { getShuffledData } from '../lib/data';
import type { CardType } from '../lib/type';
import Card from './Card';
import './CardContainer.css';

type SelectCard = CardType & {
  index: number;
};

export interface CardContainerRef {
  reset: () => void;
}

interface CardContainerProps {
  handleTogglePlayerTurn: () => void;
  handleAddScore: () => void;
  isResetting: boolean;
  setIsResetting: (value: boolean) => void;
  setShuffleDone: (value: boolean) => void;
}
const CardContainer = forwardRef<CardContainerRef, CardContainerProps>(
  (
    {
      handleAddScore,
      handleTogglePlayerTurn,
      isResetting,
      setIsResetting,
      setShuffleDone,
    },
    ref
  ) => {
    const [cards, setCards] = useState(() => getShuffledData());
    const [firstSelectedCard, setFirstSelectedCard] = useState<SelectCard>();
    const [secondSelectedCard, setSecondSelectedCard] = useState<SelectCard>();
    const [matchList, setMatchList] = useState<number[]>([]);

    useImperativeHandle(ref, () => ({
      reset: async () => {
        setIsResetting(true);
        setShuffleDone(true);

        // Wait for gather animation
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Shuffle phase
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Reset game state and deal cards
        setCards(getShuffledData());
        setFirstSelectedCard(undefined);
        setSecondSelectedCard(undefined);
        setMatchList([]);
        setIsResetting(false);

        // Wait for deal animation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setShuffleDone(false);
      },
    }));

    const handleClickCard = useCallback(
      (card: SelectCard) => {
        if (card.index === firstSelectedCard?.index) return;

        if (firstSelectedCard) {
          setSecondSelectedCard(card);
          setTimeout(() => {
            if (firstSelectedCard.symbol === card.symbol) {
              handleAddScore();
              setMatchList((prev) => [
                ...prev,
                firstSelectedCard.index,
                card.index,
              ]);
            } else {
              handleTogglePlayerTurn();
            }
            setFirstSelectedCard(undefined);
            setSecondSelectedCard(undefined);
          }, 1000);
        } else {
          setFirstSelectedCard(card);
        }
      },
      [firstSelectedCard, handleAddScore, handleTogglePlayerTurn]
    );

    return (
      <div className="grid grid-cols-6 grid-rows-3 gap-4 p-4 place-items-center">
        {cards.map((item, i) => {
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
                      rotateZ: Math.random() * 360,
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
                isMatch={matchList.includes(i)}
                isSelected={
                  matchList.includes(i) ||
                  secondSelectedCard?.index === i ||
                  firstSelectedCard?.index === i
                }
                onClickCard={() => {
                  if (secondSelectedCard || isResetting) return;
                  handleClickCard({ ...item, index: i });
                }}
              />
            </motion.div>
          );
        })}
      </div>
    );
  }
);

export default CardContainer;
