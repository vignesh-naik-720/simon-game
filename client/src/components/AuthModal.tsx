import React, { useState } from 'react';
import { AuthApi, UserProfile } from '../api/auth-api';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await AuthApi.register(username.trim(), password);
      } else {
        res = await AuthApi.login(username.trim(), password);
      }
      onSuccess(res.user);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e1e2d',
          padding: '32px',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '380px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            {isRegister ? 'Create Player Account' : 'Player Login'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888899',
              fontSize: '1.4rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              border: '1px solid #dc3545',
              borderRadius: '8px',
              color: '#ff6b7b',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaaaaa', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. SpeedDemon"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: '#12121c',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaaaaa', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: '#12121c',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#00d4ff',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Processing...' : isRegister ? 'Register & Play' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#888899' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4ff',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: 0,
            }}
          >
            {isRegister ? 'Login here' : 'Register now'}
          </button>
        </div>
      </div>
    </div>
  );
};
