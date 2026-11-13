import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ColorPad, GameEngineState } from './engine/types';
import { SimonEngine } from './engine/simon-engine';
import { PlaybackRunner } from './engine/playback-runner';
import { TurnTimer } from './engine/timer';
import { useAudioHooks } from './audio/use-audio';
import { SimonBoard } from './components/SimonBoard';
import { ScoreHeader } from './components/ScoreHeader';
import { AuthModal } from './components/AuthModal';
import { GameOverModal } from './components/GameOverModal';
import { AuthApi, UserProfile } from './api/auth-api';
import { ScoresApi } from './api/scores-api';

export const App: React.FC = () => {
  const engineRef = useRef<SimonEngine>(new SimonEngine());
  const playbackRunnerRef = useRef<PlaybackRunner>(new PlaybackRunner());
  const [gameState, setGameState] = useState<GameEngineState>(engineRef.current.getState());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const sessionStartRef = useRef<number>(Date.now());

  const { playPadSound, playErrorSound, stopAll, initializeAudio } = useAudioHooks();

  // Inactivity Turn Timer (5 seconds)
  const timerRef = useRef<TurnTimer>(
    new TurnTimer(() => {
      stopAll();
      playErrorSound();
      engineRef.current.dispatch({ type: 'TIMEOUT' });
    })
  );

  // Sync state machine updates to React state
  useEffect(() => {
    const unsubscribe = engineRef.current.subscribe((nextState) => {
      setGameState(nextState);
    });
    return () => unsubscribe();
  }, []);

  // Check existing session token on mount
  useEffect(() => {
    AuthApi.getCurrentUser()
      .then((profile) => {
        setUser(profile);
        engineRef.current.dispatch({
          type: 'SYNC_HIGHEST_SCORE',
          highestScore: profile.highestScore,
        });
      })
      .catch(() => {
        // Unauthenticated guest
      });
  }, []);

  // Handle sequence demonstration when round advances or game starts
  useEffect(() => {
    if (gameState.status === 'DEMONSTRATING') {
      timerRef.current.stop();
      playbackRunnerRef.current.play({
        sequence: gameState.sequence,
        round: gameState.currentRound,
        onStep: (pad) => {
          engineRef.current.dispatch({ type: 'PLAYBACK_STEP', pad });
        },
        playSound: (pad, duration) => {
          playPadSound(pad, duration);
        },
        onComplete: () => {
          engineRef.current.dispatch({ type: 'END_DEMONSTRATION' });
          timerRef.current.start(5000);
        },
      });
    }
  }, [gameState.status, gameState.currentRound, gameState.sequence, playPadSound]);

  // Handle Game Over: submit score to backend
  useEffect(() => {
    if (gameState.status === 'GAME_OVER') {
      timerRef.current.stop();
      playbackRunnerRef.current.cancel();

      if (user && gameState.currentScore > 0) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
        ScoresApi.recordScore({
          score: gameState.currentScore,
          roundsCompleted: Math.max(0, gameState.currentRound - 1),
          durationSeconds,
          playedAt: new Date().toISOString(),
        })
          .then((res) => {
            if (res.isNewHighest) {
              setUser((prev) => (prev ? { ...prev, highestScore: res.highestScore } : null));
            }
          })
          .catch(() => {
            // Handled via offline storage
          });
      }
    }
  }, [gameState.status, gameState.currentScore, gameState.currentRound, user]);

  // Handle auto-pause on window blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState.status === 'PLAYER_TURN') {
        timerRef.current.pause();
        engineRef.current.dispatch({ type: 'PAUSE' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState.status]);

  const handleStartGame = useCallback(async () => {
    await initializeAudio();
    sessionStartRef.current = Date.now();
    engineRef.current.dispatch({ type: 'START_GAME' });
  }, [initializeAudio]);

  const handlePadPress = useCallback(
    (pad: ColorPad) => {
      if (gameState.status !== 'PLAYER_TURN') return;

      playPadSound(pad, 250);
      timerRef.current.reset();

      const expectedPad = gameState.sequence[gameState.playerStepIndex];
      if (pad !== expectedPad) {
        playErrorSound();
      }

      engineRef.current.dispatch({
        type: 'INPUT_PAD',
        pad,
        timestamp: Date.now(),
      });
    },
    [gameState.status, gameState.sequence, gameState.playerStepIndex, playPadSound, playErrorSound]
  );

  const handlePauseToggle = useCallback(() => {
    if (gameState.status === 'PLAYER_TURN') {
      timerRef.current.pause();
      engineRef.current.dispatch({ type: 'PAUSE' });
    } else if (gameState.status === 'PAUSED') {
      timerRef.current.resume();
      engineRef.current.dispatch({ type: 'RESUME' });
    }
  }, [gameState.status]);

  const handleRestart = useCallback(async () => {
    await initializeAudio();
    sessionStartRef.current = Date.now();
    engineRef.current.dispatch({ type: 'RESET' });
    engineRef.current.dispatch({ type: 'START_GAME' });
  }, [initializeAudio]);

  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    engineRef.current.dispatch({
      type: 'SYNC_HIGHEST_SCORE',
      highestScore: loggedUser.highestScore,
    });
  };

  const handleLogout = () => {
    AuthApi.logout();
    setUser(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0c0c14',
        color: '#ffffff',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <ScoreHeader
          currentRound={gameState.currentRound}
          currentScore={gameState.currentScore}
          highestScore={gameState.highestScore}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        {/* Status Indicator Banner */}
        <div
          style={{
            textAlign: 'center',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            backgroundColor:
              gameState.status === 'DEMONSTRATING'
                ? 'rgba(0, 212, 255, 0.15)'
                : gameState.status === 'PLAYER_TURN'
                ? 'rgba(40, 167, 69, 0.15)'
                : gameState.status === 'PAUSED'
                ? 'rgba(255, 193, 7, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
            border:
              gameState.status === 'DEMONSTRATING'
                ? '1px solid #00d4ff'
                : gameState.status === 'PLAYER_TURN'
                ? '1px solid #28a745'
                : gameState.status === 'PAUSED'
                ? '1px solid #ffc107'
                : '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 'bold',
            fontSize: '1rem',
            color:
              gameState.status === 'DEMONSTRATING'
                ? '#00d4ff'
                : gameState.status === 'PLAYER_TURN'
                ? '#28a745'
                : gameState.status === 'PAUSED'
                ? '#ffc107'
                : '#aaaaaa',
          }}
        >
          {gameState.status === 'IDLE' && 'Press "Start Game" to begin'}
          {gameState.status === 'DEMONSTRATING' && '👀 Watch and listen to the sequence...'}
          {gameState.status === 'PLAYER_TURN' && `👉 Your turn! Repeat step ${gameState.playerStepIndex + 1} of ${gameState.sequence.length}`}
          {gameState.status === 'PAUSED' && '⏸️ Game Paused'}
          {gameState.status === 'GAME_OVER' && '💥 Game Over!'}
        </div>

        {/* 4-Pad Simon Board */}
        <SimonBoard
          activePad={gameState.activePad}
          isPlayerTurn={gameState.status === 'PLAYER_TURN'}
          onPadPress={handlePadPress}
        />

        {/* Controls Bar */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'center' }}>
          {gameState.status === 'IDLE' && (
            <button
              type="button"
              onClick={handleStartGame}
              style={{
                padding: '14px 32px',
                borderRadius: '30px',
                border: 'none',
                backgroundColor: '#00d4ff',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 212, 255, 0.4)',
                letterSpacing: '1px',
              }}
            >
              ▶ Start Game
            </button>
          )}

          {(gameState.status === 'PLAYER_TURN' || gameState.status === 'PAUSED') && (
            <button
              type="button"
              onClick={handlePauseToggle}
              style={{
                padding: '12px 24px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: '#222233',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              {gameState.status === 'PAUSED' ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}

          {gameState.status !== 'IDLE' && (
            <button
              type="button"
              onClick={handleRestart}
              style={{
                padding: '12px 24px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: '#222233',
                color: '#ff5577',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              🔄 Reset Game
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: '#555566' }}>
          Keyboard controls: <strong>Q</strong> (Green) &bull; <strong>W</strong> (Red) &bull; <strong>A</strong> (Yellow) &bull; <strong>S</strong> (Blue)
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <GameOverModal
        isOpen={gameState.status === 'GAME_OVER'}
        score={gameState.currentScore}
        roundsCompleted={Math.max(0, gameState.currentRound - 1)}
        highestScore={gameState.highestScore}
        user={user}
        onPlayAgain={handleRestart}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
};

export default App;
