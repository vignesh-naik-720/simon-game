import { describe, it, expect } from 'vitest';
import { SimonEngine } from '../src/engine/simon-engine';

describe('SimonEngine - Initial Sequence & Round 1 (US1)', () => {
  it('initializes in IDLE status with 0 score and empty sequence', () => {
    const engine = new SimonEngine();
    const state = engine.getState();

    expect(state.status).toBe('IDLE');
    expect(state.currentRound).toBe(0);
    expect(state.currentScore).toBe(0);
    expect(state.sequence).toEqual([]);
    expect(state.activePad).toBeNull();
    expect(state.isError).toBe(false);
  });

  it('transitions to DEMONSTRATING with a 1-step sequence when START_GAME is dispatched', () => {
    const engine = new SimonEngine();
    engine.dispatch({ type: 'START_GAME' });
    const state = engine.getState();

    expect(state.status).toBe('DEMONSTRATING');
    expect(state.currentRound).toBe(1);
    expect(state.sequence.length).toBe(1);
    expect(['green', 'red', 'yellow', 'blue']).toContain(state.sequence[0]);
  });

  it('transitions to PLAYER_TURN after demonstration completes', () => {
    const engine = new SimonEngine();
    engine.dispatch({ type: 'START_GAME' });
    engine.dispatch({ type: 'END_DEMONSTRATION' });

    const state = engine.getState();
    expect(state.status).toBe('PLAYER_TURN');
    expect(state.playerStepIndex).toBe(0);
  });

  it('advances round and increments score when player taps matching pad', () => {
    const engine = new SimonEngine();
    engine.dispatch({ type: 'START_GAME' });
    const expectedPad = engine.getState().sequence[0];

    engine.dispatch({ type: 'END_DEMONSTRATION' });
    engine.dispatch({ type: 'INPUT_PAD', pad: expectedPad, timestamp: Date.now() });

    const state = engine.getState();
    // Successfully completing Round 1 advances to Round 2 and enters DEMONSTRATING
    expect(state.currentRound).toBe(2);
    expect(state.currentScore).toBe(1);
    expect(state.sequence.length).toBe(2);
    expect(state.status).toBe('DEMONSTRATING');
  });
});
