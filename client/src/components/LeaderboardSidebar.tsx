import React, { useState, useEffect, useCallback } from 'react';
import { LeaderboardApi, LeaderboardEntry, UserScoreHistoryItem } from '../api/leaderboard-api';
import { UserProfile } from '../api/auth-api';

export interface LeaderboardSidebarProps {
  user: UserProfile | null;
  onScoreDeleted?: (newHighest: number) => void;
  refreshTrigger?: number; // Prop to force refresh when games end
}

export const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({
  user,
  onScoreDeleted,
  refreshTrigger = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'my-history'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<UserScoreHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await LeaderboardApi.getLeaderboard(15);
      setLeaderboard(data);
    } catch {
      // Ignored if offline
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await LeaderboardApi.getMyHistory();
      setHistory(data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard, refreshTrigger]);

  useEffect(() => {
    if (activeTab === 'my-history' && user) {
      fetchHistory();
    }
  }, [activeTab, user, fetchHistory, refreshTrigger]);

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Are you sure you want to delete this score record?')) return;

    setDeletingId(scoreId);
    try {
      const res = await LeaderboardApi.deleteScore(scoreId);
      setHistory((prev) => prev.filter((s) => s.id !== scoreId));
      fetchLeaderboard();
      if (onScoreDeleted) {
        onScoreDeleted(res.newHighestScore);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete score.');
    } finally {
      setDeletingId(null);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇 1st';
    if (rank === 2) return '🥈 2nd';
    if (rank === 3) return '🥉 3rd';
    return `#${rank}`;
  };

  return (
    <aside
      style={{
        backgroundColor: '#161622',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        height: 'fit-content',
      }}
    >
      {/* Sidebar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffc107', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏆 Leaderboard
        </h3>
        <button
          type="button"
          onClick={() => (activeTab === 'global' ? fetchLeaderboard() : fetchHistory())}
          disabled={loading}
          title="Refresh rankings"
          style={{
            background: 'none',
            border: 'none',
            color: '#00d4ff',
            cursor: loading ? 'wait' : 'pointer',
            fontSize: '1rem',
            padding: '4px',
          }}
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#0f0f18',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('global')}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'global' ? '#222238' : 'transparent',
            color: activeTab === 'global' ? '#00d4ff' : '#888899',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Global Top
        </button>
        {user && (
          <button
            type="button"
            onClick={() => setActiveTab('my-history')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'my-history' ? '#222238' : 'transparent',
              color: activeTab === 'my-history' ? '#00d4ff' : '#888899',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            My History
          </button>
        )}
      </div>

      {/* Tab 1: Global Rankings */}
      {activeTab === 'global' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#666677', fontSize: '0.9rem' }}>
              No scores recorded yet. Be the first to play and claim #1!
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: entry.isCurrentUser ? 'rgba(0, 212, 255, 0.12)' : '#10101a',
                  border: entry.isCurrentUser
                    ? '1px solid rgba(0, 212, 255, 0.4)'
                    : entry.rank === 1
                    ? '1px solid rgba(255, 193, 7, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: entry.rank === 1 ? '#ffc107' : entry.rank === 2 ? '#cccccc' : entry.rank === 3 ? '#cd7f32' : '#888899',
                      minWidth: '45px',
                    }}
                  >
                    {getRankBadge(entry.rank)}
                  </span>
                  <div>
                    <span style={{ fontWeight: 'bold', color: entry.isCurrentUser ? '#00d4ff' : '#ffffff', fontSize: '0.95rem' }}>
                      {entry.username}
                    </span>
                    {entry.isCurrentUser && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: '#00d4ff',
                          color: '#000000',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          marginLeft: '6px',
                          fontWeight: 'bold',
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>
                    {entry.highestScore}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: My Score History (CRUD Delete) */}
      {activeTab === 'my-history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#666677', fontSize: '0.9rem' }}>
              You haven&apos;t completed any saved games yet!
            </div>
          ) : (
            history.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#10101a',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#28a745', fontSize: '1rem' }}>
                    Score: {s.score} <span style={{ color: '#888899', fontSize: '0.8rem' }}>({s.roundsCompleted} rounds)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666677', marginTop: '2px' }}>
                    {new Date(s.playedAt).toLocaleDateString()} {new Date(s.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {s.durationSeconds}s
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteScore(s.id)}
                  disabled={deletingId === s.id}
                  title="Delete score"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff5577',
                    cursor: deletingId === s.id ? 'wait' : 'pointer',
                    fontSize: '1rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {deletingId === s.id ? '⏳' : '🗑️'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};
