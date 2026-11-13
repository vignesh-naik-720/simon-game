export type ColorPad = 'green' | 'red' | 'yellow' | 'blue';

export type GameStatus =
  | 'IDLE'           // Initial state or reset state
  | 'DEMONSTRATING'  // System playing back audio-visual sequence
  | 'PLAYER_TURN'    // Awaiting player input
  | 'PAUSED'         // Active game paused
  | 'GAME_OVER';     // Mistake made or turn timed out

export interface PadConfig {
  readonly id: ColorPad;
  readonly name: string;
  readonly frequency: number;     // Harmonic pitch in Hz
  readonly baseColor: string;     // Nominal hex color
  readonly highlightColor: string;// Illuminated hex color
  readonly keyBinding: string;    // Keyboard key for accessibility
}

export const PAD_CONFIGS: Record<ColorPad, PadConfig> = {
  green: {
    id: 'green',
    name: 'Green',
    frequency: 415,
    baseColor: '#1e7e34',
    highlightColor: '#28a745',
    keyBinding: 'q',
  },
  red: {
    id: 'red',
    name: 'Red',
    frequency: 310,
    baseColor: '#bd2130',
    highlightColor: '#dc3545',
    keyBinding: 'w',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    frequency: 252,
    baseColor: '#d39e00',
    highlightColor: '#ffc107',
    keyBinding: 'a',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    frequency: 209,
    baseColor: '#117a8b',
    highlightColor: '#17a2b8',
    keyBinding: 's',
  },
};

export const ERROR_FREQUENCY = 42; // Low-frequency error buzzer

export interface GameEngineState {
  readonly status: GameStatus;
  readonly sequence: readonly ColorPad[];
  readonly currentRound: number;
  readonly currentScore: number;
  readonly playerStepIndex: number;
  readonly activePad: ColorPad | null;
  readonly isError: boolean;
  readonly remainingTurnTimeMs: number;
  readonly highestScore: number;
}

export type GameAction =
  | { type: 'START_GAME'; seed?: number }
  | { type: 'PLAYBACK_STEP'; pad: ColorPad | null }
  | { type: 'END_DEMONSTRATION' }
  | { type: 'INPUT_PAD'; pad: ColorPad; timestamp: number }
  | { type: 'TIMEOUT' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SYNC_HIGHEST_SCORE'; highestScore: number };
