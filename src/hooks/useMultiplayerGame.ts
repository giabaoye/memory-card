import { useCallback, useEffect, useState } from 'react';
import { onDisconnect, onValue, ref, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import type { CardType } from '../lib/type';

export type PlayerNumber = 1 | 2;

export interface GameRoom {
  roomCode: string;
  cards: CardType[];
  currentPlayer: PlayerNumber;
  scores: {
    player1: number;
    player2: number;
  };
  firstSelectedIndex?: number;
  secondSelectedIndex?: number;
  matchedIndices: string;
  players: {
    player1?: {
      connected: boolean;
      name: string;
    };
    player2?: {
      connected: boolean;
      name: string;
    };
  };
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export const useMultiplayerGame = () => {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [playerNumber, setPlayerNumber] = useState<PlayerNumber | null>(null);
  const [error, setError] = useState<string>('');

  // Generate 6-digit room code
  const generateRoomCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create a new game room
  const createRoom = useCallback(
    async (cards: CardType[], playerName: string = 'Player 1') => {
      const roomCode = generateRoomCode();
      const roomRef = ref(database, `rooms/${roomCode}`);

      const newRoom: GameRoom = {
        roomCode,
        cards,
        currentPlayer: 1,
        scores: { player1: 0, player2: 0 },
        matchedIndices: '',
        players: {
          player1: {
            connected: true,
            name: playerName,
          },
        },
        status: 'waiting',
        createdAt: Date.now(),
      };
      try {
        await set(roomRef, newRoom);
        setPlayerNumber(1);
        setGameRoom(newRoom);

        // Handle disconnect
        const player1Ref = ref(
          database,
          `rooms/${roomCode}/players/player1/connected`
        );
        onDisconnect(player1Ref).set(false);

        return roomCode;
      } catch (err) {
        setError('Failed to create room');
        console.error(err);
        return null;
      }
    },
    []
  );

  // Join an existing game room
  const joinRoom = useCallback(
    async (roomCode: string, playerName: string = 'Player 2') => {
      const roomRef = ref(database, `rooms/${roomCode}`);

      try {
        // Check if room exists
        const snapshot = await new Promise<{
          exists: () => boolean;
          val: () => GameRoom;
        }>((resolve) => {
          onValue(
            roomRef,
            (snapshot) => {
              resolve(
                snapshot as { exists: () => boolean; val: () => GameRoom }
              );
            },
            { onlyOnce: true }
          );
        });

        if (!snapshot.exists()) {
          setError('Room not found');
          return false;
        }

        const room = snapshot.val() as GameRoom;
        if (room.players.player2) {
          setError('Room is full');
          return false;
        }

        if (room.status !== 'waiting') {
          setError('Game already in progress');
          return false;
        }

        // Join as player 2
        await update(roomRef, {
          'players/player2': {
            connected: true,
            name: playerName,
          },
          status: 'playing',
        });

        setPlayerNumber(2);

        // Set the room data so the listener can start
        const updatedRoom = {
          ...room,
          players: {
            ...room.players,
            player2: {
              connected: true,
              name: playerName,
            },
          },
          status: 'playing' as const,
        };
        setGameRoom(updatedRoom);

        // Handle disconnect
        const player2Ref = ref(
          database,
          `rooms/${roomCode}/players/player2/connected`
        );
        onDisconnect(player2Ref).set(false);

        return true;
      } catch (err) {
        setError('Failed to join room');
        console.error(err);
        return false;
      }
    },
    []
  );

  // Listen to room updates
  useEffect(() => {
    if (!gameRoom?.roomCode) return;

    const roomRef = ref(database, `rooms/${gameRoom.roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameRoom(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [gameRoom?.roomCode]);

  // Update game state
  const updateGameState = useCallback(
    async (updates: Partial<GameRoom>) => {
      if (!gameRoom?.roomCode) return;

      const roomRef = ref(database, `rooms/${gameRoom.roomCode}`);
      try {
        await update(roomRef, updates);
      } catch (err) {
        console.error('Failed to update game state:', err);
      }
    },
    [gameRoom]
  );

  // Handle card selection
  const selectCard = useCallback(
    async (cardIndex: number) => {
      if (!gameRoom || playerNumber !== gameRoom.currentPlayer) return;

      if (gameRoom.firstSelectedIndex === undefined) {
        await updateGameState({ firstSelectedIndex: cardIndex });
      } else if (gameRoom.secondSelectedIndex === undefined) {
        await updateGameState({ secondSelectedIndex: cardIndex });

        // Check for match after 1 second
        setTimeout(async () => {
          const firstCard = gameRoom.cards[gameRoom.firstSelectedIndex!];
          const secondCard = gameRoom.cards[cardIndex];

          if (firstCard.symbol === secondCard.symbol) {
            // Match found
            const newMatchedIndices = [
              ...gameRoom.matchedIndices.split(','),
              gameRoom.firstSelectedIndex!,
              cardIndex,
            ].join(',');
            const newScores = { ...gameRoom.scores };

            if (playerNumber === 1) {
              newScores.player1++;
            } else {
              newScores.player2++;
            }

            await updateGameState({
              matchedIndices: newMatchedIndices,
              scores: newScores,
              firstSelectedIndex: undefined,
              secondSelectedIndex: undefined,
            });
          } else {
            // No match - switch player
            await updateGameState({
              currentPlayer: gameRoom.currentPlayer === 1 ? 2 : 1,
              firstSelectedIndex: undefined,
              secondSelectedIndex: undefined,
            });
          }
        }, 1000);
      }
    },
    [gameRoom, playerNumber, updateGameState]
  );

  // Reset game
  const resetGame = useCallback(
    async (newCards: CardType[]) => {
      if (!gameRoom?.roomCode) return;

      await updateGameState({
        cards: newCards,
        currentPlayer: 1,
        scores: { player1: 0, player2: 0 },
        firstSelectedIndex: undefined,
        secondSelectedIndex: undefined,
        matchedIndices: '',
      });
    },
    [gameRoom?.roomCode, updateGameState]
  );

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!gameRoom?.roomCode || !playerNumber) return;

    const playerRef = ref(
      database,
      `rooms/${gameRoom.roomCode}/players/player${playerNumber}/connected`
    );
    await set(playerRef, false);

    setGameRoom(null);
    setPlayerNumber(null);
  }, [gameRoom, playerNumber]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    gameRoom,
    playerNumber,
    error,
    createRoom,
    clearError,
    joinRoom,
    selectCard,
    updateGameState,
    resetGame,
    leaveRoom,
  };
};
