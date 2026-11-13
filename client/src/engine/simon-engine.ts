import { ColorPad, GameAction, GameEngineState } from './types';

const ALL_PADS: ColorPad[] = ['green', 'red', 'yellow', 'blue'];

export const INITIAL_STATE: GameEngineState = {
  status: 'IDLE',
  sequence: [],
  currentRound: 0,
  currentScore: 0,
  playerStepIndex: 0,
  activePad: null,
  isError: false,
  remainingTurnTimeMs: 5000,
  highestScore: 0,
};

export function getRandomPad(seed?: number): ColorPad {
  if (seed !== undefined) {
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return ALL_PADS[Math.floor(rand * ALL_PADS.length)];
  }
  return ALL_PADS[Math.floor(Math.random() * ALL_PADS.length)];
}

export function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  switch (action.type) {
    case 'START_GAME': {
      const firstPad = getRandomPad(action.seed);
      return {
        ...state,
        status: 'DEMONSTRATING',
        sequence: [firstPad],
        currentRound: 1,
        currentScore: 0,
        playerStepIndex: 0,
        activePad: null,
        isError: false,
        remainingTurnTimeMs: 5000,
      };
    }

    case 'PLAYBACK_STEP': {
      if (state.status !== 'DEMONSTRATING') return state;
      return {
        ...state,
        activePad: action.pad,
      };
    }

    case 'END_DEMONSTRATION': {
      if (state.status !== 'DEMONSTRATING') return state;
      return {
        ...state,
        status: 'PLAYER_TURN',
        activePad: null,
        playerStepIndex: 0,
        remainingTurnTimeMs: 5000,
      };
    }

    case 'INPUT_PAD': {
      if (state.status !== 'PLAYER_TURN') return state;

      const expectedPad = state.sequence[state.playerStepIndex];
      if (action.pad !== expectedPad) {
        // Mistake made: Transition to GAME_OVER
        const newHighest = Math.max(state.highestScore, state.currentScore);
        return {
          ...state,
          status: 'GAME_OVER',
          activePad: action.pad,
          isError: true,
          highestScore: newHighest,
        };
      }

      // Correct pad!
      const isRoundComplete = state.playerStepIndex === state.sequence.length - 1;

      if (isRoundComplete) {
        const nextScore = state.currentScore + 1;
        const nextRound = state.currentRound + 1;
        const nextStep = getRandomPad();
        const nextSequence = [...state.sequence, nextStep];
        const newHighest = Math.max(state.highestScore, nextScore);

        return {
          ...state,
          status: 'DEMONSTRATING',
          sequence: nextSequence,
          currentRound: nextRound,
          currentScore: nextScore,
          playerStepIndex: 0,
          activePad: null,
          highestScore: newHighest,
          remainingTurnTimeMs: 5000,
        };
      }

      // Correct step, advance step index
      return {
        ...state,
        playerStepIndex: state.playerStepIndex + 1,
        activePad: action.pad,
      };
    }

    case 'TIMEOUT': {
      if (state.status !== 'PLAYER_TURN') return state;
      return {
        ...state,
        status: 'GAME_OVER',
        isError: true,
        highestScore: Math.max(state.highestScore, state.currentScore),
      };
    }

    case 'PAUSE': {
      if (state.status !== 'PLAYER_TURN') return state;
      return {
        ...state,
        status: 'PAUSED',
      };
    }

    case 'RESUME': {
      if (state.status !== 'PAUSED') return state;
      return {
        ...state,
        status: 'PLAYER_TURN',
      };
    }

    case 'RESET': {
      return {
        ...INITIAL_STATE,
        highestScore: state.highestScore,
      };
    }

    case 'SYNC_HIGHEST_SCORE': {
      return {
        ...state,
        highestScore: Math.max(state.highestScore, action.highestScore),
      };
    }

    default:
      return state;
  }
}

export class SimonEngine {
  private state: GameEngineState;
  private listeners: Array<(state: GameEngineState) => void> = [];

  constructor(initialState: GameEngineState = INITIAL_STATE) {
    this.state = initialState;
  }

  public getState(): GameEngineState {
    return this.state;
  }

  public dispatch(action: GameAction): GameEngineState {
    this.state = gameReducer(this.state, action);
    for (const listener of this.listeners) {
      listener(this.state);
    }
    return this.state;
  }

  public subscribe(listener: (state: GameEngineState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }
}
