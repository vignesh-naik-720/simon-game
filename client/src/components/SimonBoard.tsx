import React, { useEffect } from 'react';
import { ColorPad, PAD_CONFIGS } from '../engine/types';
import { Pad } from './Pad';

export interface SimonBoardProps {
  activePad: ColorPad | null;
  isPlayerTurn: boolean;
  onPadPress: (pad: ColorPad) => void;
}

export const SimonBoard: React.FC<SimonBoardProps> = ({ activePad, isPlayerTurn, onPadPress }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayerTurn) return;
      const key = e.key.toLowerCase();
      const matchedPad = (Object.keys(PAD_CONFIGS) as ColorPad[]).find(
        (pad) => PAD_CONFIGS[pad].keyBinding === key
      );
      if (matchedPad) {
        onPadPress(matchedPad);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTurn, onPadPress]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        padding: '24px',
        backgroundColor: '#1a1a24',
        borderRadius: '50%',
        boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
        width: '340px',
        height: '340px',
        margin: '0 auto',
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      <Pad
        pad="green"
        isHighlighted={activePad === 'green'}
        disabled={!isPlayerTurn}
        onPress={onPadPress}
      />
      <Pad
        pad="red"
        isHighlighted={activePad === 'red'}
        disabled={!isPlayerTurn}
        onPress={onPadPress}
      />
      <Pad
        pad="yellow"
        isHighlighted={activePad === 'yellow'}
        disabled={!isPlayerTurn}
        onPress={onPadPress}
      />
      <Pad
        pad="blue"
        isHighlighted={activePad === 'blue'}
        disabled={!isPlayerTurn}
        onPress={onPadPress}
      />
    </div>
  );
};
