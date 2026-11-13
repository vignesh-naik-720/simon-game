import { describe, it, expect } from 'vitest';
import { getStepTiming, SPEED_FLOOR_MS } from '../src/engine/difficulty';

describe('Difficulty Curves (US2)', () => {
  it('returns baseline timing for rounds 1-5', () => {
    const timing = getStepTiming(1);
    expect(timing.toneDurationMs).toBe(420);
    expect(timing.gapDurationMs).toBe(100);
  });

  it('accelerates playback for rounds 6-13', () => {
    const timing = getStepTiming(6);
    expect(timing.toneDurationMs).toBe(320);
    expect(timing.gapDurationMs).toBe(80);
  });

  it('accelerates further for rounds 14-30', () => {
    const timing = getStepTiming(14);
    expect(timing.toneDurationMs).toBe(240);
    expect(timing.gapDurationMs).toBe(60);
  });

  it('strictly enforces the 180ms speed floor for high rounds (31+)', () => {
    const timing = getStepTiming(50);
    expect(timing.toneDurationMs).toBe(SPEED_FLOOR_MS);
    expect(timing.toneDurationMs).toBeGreaterThanOrEqual(180);
  });
});
