export interface StepTiming {
  readonly toneDurationMs: number;
  readonly gapDurationMs: number;
}

export const SPEED_FLOOR_MS = 180;

export function getStepTiming(round: number): StepTiming {
  if (round <= 5) {
    return { toneDurationMs: 420, gapDurationMs: 100 };
  }
  if (round <= 13) {
    return { toneDurationMs: 320, gapDurationMs: 80 };
  }
  if (round <= 30) {
    return { toneDurationMs: 240, gapDurationMs: 60 };
  }
  return { toneDurationMs: SPEED_FLOOR_MS, gapDurationMs: 50 };
}
