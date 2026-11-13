import { useCallback, useRef } from 'react';
import { ColorPad } from '../engine/types';
import { IAudioService, defaultAudioService } from './web-audio-synth';

export interface UseAudioHooksReturn {
  playPadSound: (pad: ColorPad, durationMs?: number) => void;
  playErrorSound: (durationMs?: number) => void;
  stopAll: () => void;
  initializeAudio: () => Promise<void>;
}

export function useAudioHooks(service: IAudioService = defaultAudioService): UseAudioHooksReturn {
  const serviceRef = useRef<IAudioService>(service);

  const initializeAudio = useCallback(async () => {
    await serviceRef.current.initialize();
  }, []);

  const playPadSound = useCallback((pad: ColorPad, durationMs?: number) => {
    serviceRef.current.playPadSound(pad, durationMs).catch(() => {});
  }, []);

  const playErrorSound = useCallback((durationMs?: number) => {
    serviceRef.current.playErrorSound(durationMs).catch(() => {});
  }, []);

  const stopAll = useCallback(() => {
    serviceRef.current.stopAll();
  }, []);

  return {
    playPadSound,
    playErrorSound,
    stopAll,
    initializeAudio,
  };
}
