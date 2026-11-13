/**
 * Audio Service Interface Contract
 * Conforms to Simon Game Constitution Principle II (Abstracted Audio & Multi-Platform Presentation)
 */

export type PadColor = 'green' | 'red' | 'yellow' | 'blue';

export interface SoundProfile {
  readonly frequency: number;
  readonly type: OscillatorType;
  readonly attackMs: number;
  readonly decayMs: number;
}

export interface IAudioService {
  /**
   * Initializes audio context on first user interaction (unlocks web audio policy)
   */
  initialize(): Promise<void>;

  /**
   * Plays the distinct harmonic tone for the specified pad color
   * @param pad The color pad to sound
   * @param durationMs Optional duration override in milliseconds
   */
  playPadSound(pad: PadColor, durationMs?: number): Promise<void>;

  /**
   * Plays the low-frequency error buzzer tone
   * @param durationMs Optional duration in milliseconds (defaults to 600ms)
   */
  playErrorSound(durationMs?: number): Promise<void>;

  /**
   * Immediately stops any currently active audio synthesis
   */
  stopAll(): void;

  /**
   * Returns whether audio is currently initialized and enabled
   */
  isReady(): boolean;
}

export interface UseAudioHooksReturn {
  playPadSound: (pad: PadColor, durationMs?: number) => void;
  playErrorSound: (durationMs?: number) => void;
  stopAll: () => void;
  isReady: boolean;
}

