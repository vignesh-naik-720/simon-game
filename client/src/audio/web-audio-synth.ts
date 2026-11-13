import { ColorPad, PAD_CONFIGS, ERROR_FREQUENCY } from '../engine/types';

export interface IAudioService {
  initialize(): Promise<void>;
  playPadSound(pad: ColorPad, durationMs?: number): Promise<void>;
  playErrorSound(durationMs?: number): Promise<void>;
  stopAll(): void;
  isReady(): boolean;
}

export class WebAudioSynthesizer implements IAudioService {
  private ctx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];

  public async initialize(): Promise<void> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public isReady(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  public async playPadSound(pad: ColorPad, durationMs: number = 300): Promise<void> {
    await this.initialize();
    if (!this.ctx) return;

    const config = PAD_CONFIGS[pad];
    if (!config) return;

    this.playTone(config.frequency, 'sine', durationMs);
  }

  public async playErrorSound(durationMs: number = 600): Promise<void> {
    await this.initialize();
    if (!this.ctx) return;

    this.playTone(ERROR_FREQUENCY, 'sawtooth', durationMs);
  }

  public stopAll(): void {
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignored if already stopped
      }
    }
    this.activeOscillators = [];
  }

  private playTone(frequency: number, type: OscillatorType, durationMs: number): void {
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const durationSec = durationMs / 1000;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    // Gain envelope shaping: quick attack, smooth exponential decay to prevent clicks
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec);

    this.activeOscillators.push(osc);
    osc.onended = () => {
      const idx = this.activeOscillators.indexOf(osc);
      if (idx !== -1) {
        this.activeOscillators.splice(idx, 1);
      }
    };
  }
}

export const defaultAudioService: IAudioService = new WebAudioSynthesizer();
