import React from 'react';
import { UserProfile } from '../api/auth-api';

export interface ScoreHeaderProps {
  currentRound: number;
  currentScore: number;
  highestScore: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  currentRound,
  currentScore,
  highestScore,
  user,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: '#16161f',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '4px', color: '#ffffff' }}>
          SIMON
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#888899', marginTop: '2px' }}>
          {user ? (
            <span>
              Player: <strong style={{ color: '#00d4ff' }}>{user.username}</strong>{' '}
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff5577',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.8rem',
                  marginLeft: '8px',
                }}
              >
                Logout
              </button>
            </span>
          ) : (
            <span>
              Playing as <em>Guest</em> —{' '}
              <button
                type="button"
                onClick={onOpenAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00d4ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                Login to Save Scores
              </button>
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888899', textTransform: 'uppercase' }}>
            Round
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffffff' }}>
            {currentRound > 0 ? currentRound : '-'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888899', textTransform: 'uppercase' }}>
            Score
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#28a745' }}>
            {currentScore}
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            padding: '6px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#ffc107', textTransform: 'uppercase' }}>
            🏆 Highest Record
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffc107' }}>
            {highestScore}
          </div>
        </div>
      </div>
    </header>
  );
};
