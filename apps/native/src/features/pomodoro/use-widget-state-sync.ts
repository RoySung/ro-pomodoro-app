import { Platform } from 'react-native';
import { useEffect } from 'react';

import { syncWidgetState } from '../../../modules/widget-bridge';
import type { PersistedPomodoroState } from './domain';

export const useWidgetStateSync = (state: PersistedPomodoroState | null) => {
  const phase = state?.phase;
  const phaseStartedAt = state?.phaseStartedAt ?? null;
  const focusDurationMinutes = state?.settings.focusDurationMinutes;
  const restDurationMinutes = state?.settings.restDurationMinutes;

  useEffect(() => {
    if (Platform.OS !== 'ios' || !state)
      return;

    syncWidgetState({
      phase: state.phase,
      phaseStartedAt: state.phaseStartedAt,
      focusDurationMinutes: state.settings.focusDurationMinutes,
      restDurationMinutes: state.settings.restDurationMinutes,
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseStartedAt, focusDurationMinutes, restDurationMinutes]);
};
