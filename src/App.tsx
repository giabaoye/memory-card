import { useRef, useState } from 'react';
import GameControl from './GameControl';
import CardContainer, {
  type CardContainerRef,
} from './components/CardContainer';
import Lobby from './components/Lobby';
import MultiplayerCardContainer from './components/MultiplayerCardContainer';
import MultiplayerGameControl from './components/MultiplayerGameControl';
import WaitingRoom from './components/WaitingRoom';
import { useGamePlay } from './hooks/useGamePlay';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { getShuffledData } from './lib/data';
import './App.css';

type GameMode = 'menu' | 'singleplayer' | 'waiting' | 'multiplayer';

function App() {
  const cardContainerRef = useRef<CardContainerRef>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [shuffleDone, setShuffleDone] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const {
    score,
    handleAddScore,
    handleTogglePlayerTurn,
    isFirstPlayerTurn,
    resetGame,
  } = useGamePlay();

  const {
    gameRoom,
    playerNumber,
    error,
    clearError,
    createRoom,
    joinRoom,
    selectCard,
    resetGame: resetMultiplayerGame,
    leaveRoom,
  } = useMultiplayerGame();

  const handleReset = () => {
    resetGame();
    cardContainerRef.current?.reset();
  };

  const handleCreateRoom = async () => {
    clearError();
    const cards = getShuffledData();
    const code = await createRoom(cards);
    if (code) {
      setGameMode('waiting');
    }
  };

  const handleJoinRoom = async () => {
    clearError();
    setIsJoining(true);
    const success = await joinRoom(roomCodeInput);
    if (success) {
      setGameMode('multiplayer');
    }
    setIsJoining(false);
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    setGameMode('menu');
  };

  const handleMultiplayerReset = async () => {
    setIsResetting(true);
    const newCards = getShuffledData();
    await resetMultiplayerGame(newCards);

    // Simulate reset animation timing
    setTimeout(() => {
      setIsResetting(false);
    }, 1800);
  };

  // Automatically switch from waiting to playing when player 2 joins
  if (gameMode === 'waiting' && gameRoom?.status === 'playing') {
    setGameMode('multiplayer');
  }

  // Render lobby
  if (gameMode === 'menu') {
    return (
      <div className="app-container">
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={() => handleJoinRoom()}
          error={error}
          roomCode={roomCodeInput}
          setRoomCode={setRoomCodeInput}
          isJoining={isJoining}
        />
        <button
          className="mode-toggle"
          onClick={() => setGameMode('singleplayer')}
        >
          Play Solo
        </button>
      </div>
    );
  }

  // Render waiting room
  if (gameMode === 'waiting' && gameRoom) {
    return (
      <WaitingRoom roomCode={gameRoom.roomCode} onCancel={handleLeaveRoom} />
    );
  }

  // Render multiplayer game
  if (gameMode === 'multiplayer' && gameRoom && playerNumber) {
    return (
      <>
        <MultiplayerGameControl
          gameRoom={gameRoom}
          playerNumber={playerNumber}
          onReset={handleMultiplayerReset}
          onLeave={handleLeaveRoom}
          isResetting={isResetting}
        />
        <MultiplayerCardContainer
          gameRoom={gameRoom}
          playerNumber={playerNumber}
          onCardClick={selectCard}
          isResetting={isResetting}
        />
      </>
    );
  }

  // Render single-player game
  return (
    <>
      <GameControl
        isFirstPlayerTurn={isFirstPlayerTurn}
        score={score}
        handleReset={handleReset}
        shuffleDone={shuffleDone}
      />

      <CardContainer
        ref={cardContainerRef}
        handleTogglePlayerTurn={handleTogglePlayerTurn}
        handleAddScore={handleAddScore}
        isResetting={isResetting}
        setIsResetting={setIsResetting}
        setShuffleDone={setShuffleDone}
      />

      <button className="mode-toggle" onClick={() => setGameMode('menu')}>
        Multiplayer Mode
      </button>
    </>
  );
}

export default App;
