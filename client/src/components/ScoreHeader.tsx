import React from 'react';
import { UserProfile } from '../api/auth-api';
import { GlobalChampionInfo } from '../api/leaderboard-api';

export interface ScoreHeaderProps {
  currentRound: number;
  currentScore: number;
  personalBest: number;
  globalChampion: GlobalChampionInfo | null;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  currentRound,
  currentScore,
  personalBest,
  globalChampion,
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
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '4px', color: '#ffffff' }}>
          SIMON
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#888899', marginTop: '4px' }}>
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
              Playing as <em>Guest</em> &bull;{' '}
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
                Login / Register
              </button>
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888899', textTransform: 'uppercase' }}>
            Round
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ffffff' }}>
            {currentRound > 0 ? currentRound : '-'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888899', textTransform: 'uppercase' }}>
            Score
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#28a745' }}>
            {currentScore}
          </div>
        </div>

        {user && (
          <div
            style={{
              textAlign: 'center',
              backgroundColor: 'rgba(0, 212, 255, 0.08)',
              padding: '6px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 255, 0.25)',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#00d4ff', textTransform: 'uppercase' }}>
              👤 Personal Best
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {personalBest}
            </div>
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            padding: '6px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#ffc107', textTransform: 'uppercase' }}>
            🏆 Global Record
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ffc107' }}>
            {globalChampion && globalChampion.highestScore > 0 ? (
              <span>
                {globalChampion.highestScore}{' '}
                <span style={{ fontSize: '0.75rem', color: '#ffffff', opacity: 0.85, fontWeight: 'normal' }}>
                  ({globalChampion.championUsername})
                </span>
              </span>
            ) : (
              '0'
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
