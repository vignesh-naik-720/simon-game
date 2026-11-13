import { ColorPad } from './types';
import { getStepTiming } from './difficulty';

export interface PlaybackOptions {
  sequence: readonly ColorPad[];
  round: number;
  onStep: (pad: ColorPad | null) => void;
  playSound: (pad: ColorPad, durationMs: number) => void;
  onComplete: () => void;
}

export class PlaybackRunner {
  private isCancelled = false;
  private currentTimeout: ReturnType<typeof setTimeout> | null = null;

  public async play(options: PlaybackOptions): Promise<void> {
    this.isCancelled = false;
    const { sequence, round, onStep, playSound, onComplete } = options;
    const timing = getStepTiming(round);

    // Initial slight pause before playback begins
    await this.delay(400);

    for (let i = 0; i < sequence.length; i++) {
      if (this.isCancelled) return;

      const pad = sequence[i];
      onStep(pad);
      playSound(pad, timing.toneDurationMs);

      await this.delay(timing.toneDurationMs);
      if (this.isCancelled) return;

      onStep(null);
      await this.delay(timing.gapDurationMs);
    }

    if (!this.isCancelled) {
      onComplete();
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.currentTimeout = setTimeout(resolve, ms);
    });
  }
}
