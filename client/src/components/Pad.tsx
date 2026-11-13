import React from 'react';
import { ColorPad, PAD_CONFIGS } from '../engine/types';

export interface PadProps {
  pad: ColorPad;
  isHighlighted: boolean;
  disabled?: boolean;
  onPress: (pad: ColorPad) => void;
}

export const Pad: React.FC<PadProps> = ({ pad, isHighlighted, disabled = false, onPress }) => {
  const config = PAD_CONFIGS[pad];

  const handleClick = () => {
    if (!disabled) {
      onPress(pad);
    }
  };

  return (
    <button
      type="button"
      role="button"
      aria-label={`${config.name} pad (Key: ${config.keyBinding.toUpperCase()})`}
      data-testid={`pad-${pad}`}
      disabled={disabled}
      onClick={handleClick}
      style={{
        width: '140px',
        height: '140px',
        margin: '12px',
        borderRadius: '24px',
        border: isHighlighted ? '4px solid #ffffff' : '4px solid rgba(0,0,0,0.3)',
        backgroundColor: isHighlighted ? config.highlightColor : config.baseColor,
        boxShadow: isHighlighted
          ? `0 0 25px ${config.highlightColor}, inset 0 0 15px rgba(255,255,255,0.6)`
          : '0 8px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.1s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '1rem',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      <span style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{config.name}</span>
      <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>[{config.keyBinding.toUpperCase()}]</span>
    </button>
  );
};
