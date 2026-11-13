import React from 'react';
import { UserProfile } from '../api/auth-api';

export interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  roundsCompleted: number;
  highestScore: number;
  user: UserProfile | null;
  onPlayAgain: () => void;
  onOpenAuth: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  roundsCompleted,
  highestScore,
  user,
  onPlayAgain,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const isNewRecord = score > 0 && score >= highestScore;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#1b1b26',
          padding: '36px 32px',
          borderRadius: '24px',
          width: '90%',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
          border: '1px solid rgba(255, 60, 60, 0.3)',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💥</div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem', color: '#ff4455', letterSpacing: '2px' }}>
          GAME OVER
        </h2>

        {isNewRecord && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 193, 7, 0.15)',
              border: '1px solid #ffc107',
              borderRadius: '12px',
              color: '#ffc107',
              fontWeight: 'bold',
              marginBottom: '20px',
              fontSize: '1rem',
            }}
          >
            🎉 NEW PERSONAL BEST! 🎉
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            backgroundColor: '#12121a',
            padding: '16px',
            borderRadius: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888899', textTransform: 'uppercase' }}>
              Final Score
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffffff' }}>
              {score}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}></div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#888899', textTransform: 'uppercase' }}>
              Rounds Cleared
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {roundsCompleted}
            </div>
          </div>
        </div>

        {!user && score > 0 && (
          <p style={{ fontSize: '0.85rem', color: '#aaaaaa', marginBottom: '20px' }}>
            Want to save this score to your profile?{' '}
            <button
              type="button"
              onClick={onOpenAuth}
              style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold',
              }}
            >
              Sign up / Login now
            </button>
          </p>
        )}

        <button
          type="button"
          onClick={onPlayAgain}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#28a745',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(40, 167, 69, 0.4)',
            transition: 'transform 0.1s',
          }}
        >
          🎮 Play Again
        </button>
      </div>
    </div>
  );
};
