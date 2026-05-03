import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { AppState, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import backgroundMusic from '@/assets/ro/music/bg-0.mp3';

interface UseBackgroundMusicOptions {
  enabled: boolean
  ready: boolean
}

const safePlay = (player: AudioPlayer) => {
  try {
    const result = player.play();
    void Promise.resolve(result).catch(() => {});
  }
  catch {
  }
};

export const useBackgroundMusic = ({ enabled, ready }: UseBackgroundMusicOptions) => {
  const player = useAudioPlayer(backgroundMusic);
  const [hasUnlockedPlayback, setHasUnlockedPlayback] = useState(Platform.OS !== 'web');
  const shouldResumeWhenActive = useRef(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  useEffect(() => {
    player.loop = true;
    player.volume = 0.45;
    player.muted = !enabled;
  }, [enabled, player]);

  useEffect(() => {
    if (!ready || !hasUnlockedPlayback || !enabled) {
      player.pause();
      return;
    }

    safePlay(player);
  }, [enabled, hasUnlockedPlayback, player, ready]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        shouldResumeWhenActive.current = ready && enabled && hasUnlockedPlayback && player.playing;
        if (player.playing)
          player.pause();
        return;
      }

      if (shouldResumeWhenActive.current && ready && enabled && hasUnlockedPlayback)
        safePlay(player);

      shouldResumeWhenActive.current = false;
    });

    return () => subscription.remove();
  }, [enabled, hasUnlockedPlayback, player, ready]);

  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  return {
    hasUnlockedPlayback,
    isAudible: ready && enabled && hasUnlockedPlayback,
    markUserInteraction: () => {
      if (!hasUnlockedPlayback)
        setHasUnlockedPlayback(true);
    },
  };
};