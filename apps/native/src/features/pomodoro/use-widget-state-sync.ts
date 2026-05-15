import { Platform } from 'react-native';
import { useEffect, useRef } from 'react';

import {
  endLiveActivity,
  startLiveActivity,
  syncWidgetState,
  updateLiveActivity,
} from '../../../modules/widget-bridge';
import type { PersistedPomodoroState } from './domain';

const isActivePhase = (phase: string | undefined): phase is 'focus' | 'rest' =>
  phase === 'focus' || phase === 'rest';

export const useWidgetStateSync = (state: PersistedPomodoroState | null) => {
  const phase = state?.phase;
  const phaseStartedAt = state?.phaseStartedAt ?? null;
  const focusDurationMinutes = state?.settings.focusDurationMinutes;
  const restDurationMinutes = state?.settings.restDurationMinutes;

  const prevPhaseRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !state)
      return;

    const payload = {
      phase: state.phase,
      phaseStartedAt: state.phaseStartedAt,
      focusDurationMinutes: state.settings.focusDurationMinutes,
      restDurationMinutes: state.settings.restDurationMinutes,
    };

    syncWidgetState(payload).catch(() => {});

    const prev = prevPhaseRef.current;
    const curr = state.phase;
    prevPhaseRef.current = curr;

    if (isActivePhase(curr) && state.phaseStartedAt) {
      if (prev !== curr) {
        if (__DEV__) console.log('[LiveActivity] start', payload);
        startLiveActivity(payload).catch((e) => {
          if (__DEV__) console.warn('[LiveActivity] start failed', e);
        });
      }
      else {
        if (__DEV__) console.log('[LiveActivity] update', payload);
        updateLiveActivity(payload).catch((e) => {
          if (__DEV__) console.warn('[LiveActivity] update failed', e);
        });
      }
    }
    else if (isActivePhase(prev) && !isActivePhase(curr)) {
      if (__DEV__) console.log('[LiveActivity] end');
      endLiveActivity().catch((e) => {
        if (__DEV__) console.warn('[LiveActivity] end failed', e);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseStartedAt, focusDurationMinutes, restDurationMinutes]);
};
