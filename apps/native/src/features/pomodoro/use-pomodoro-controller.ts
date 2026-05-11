import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createEmptyRecord,
  createInitialState,
  dayjs,
  getMonthBars,
  getPhaseDurationSeconds,
  getRecordSummary,
  getTimerSnapshot,
  getWeekBars,
  hydrateState,
  isCompletedRecord,
  STORAGE_KEY,
  type PersistedPomodoroState,
  type PomodoroSettings,
} from './domain';

const NOTIFICATION_KIND_TIME_OUT = 'timeOut';
const NOTIFICATION_KIND_STILL_WAITING = 'stillWaiting';

const cancelScheduled = async(ref: { current: string | null }) => {
  if (!ref.current)
    return;

  try {
    await Notifications.cancelScheduledNotificationAsync(ref.current);
  }
  catch {
  }

  ref.current = null;
};

const dismissStillWaiting = async() => {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    await Promise.all(
      presented
        .filter(n => n.request.content.data?.kind === NOTIFICATION_KIND_STILL_WAITING)
        .map(n => Notifications.dismissNotificationAsync(n.request.identifier).catch(() => {})),
    );
  }
  catch {
  }
};

const ensureNotificationPermissions = async() => {
  if (Platform.OS === 'web')
    return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pomodoro-reminders', {
      name: 'Pomodoro reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8fb3ff',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted)
    return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

const getNotificationBody = (phase: PersistedPomodoroState['phase']) => {
  return phase === 'focus' ? 'You need to take a break.' : 'Keep going to focus.';
};

export const usePomodoroController = () => {
  const [state, setState] = useState<PersistedPomodoroState>(createInitialState());
  const [ready, setReady] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const [weekAnchor, setWeekAnchor] = useState(() => dayjs().weekday(0));
  const [yearAnchor, setYearAnchor] = useState(() => dayjs().dayOfYear(1));
  const phaseNotificationId = useRef<string | null>(null);
  const overtimeNotificationId = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadState = async() => {
      try {
        // Cancel stale pomodoro notifications from a previous session.
        // IDs live in refs that don't survive a process kill — enumerate and filter
        // by data.kind to avoid touching unrelated apps' or system notifications.
        if (Platform.OS !== 'web') {
          try {
            const pending = await Notifications.getAllScheduledNotificationsAsync();
            await Promise.all(
              pending
                .filter((n) => {
                  const kind = n.content.data?.kind;
                  return kind === NOTIFICATION_KIND_TIME_OUT || kind === NOTIFICATION_KIND_STILL_WAITING;
                })
                .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
            );
          }
          catch {
          }
        }

        const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted)
          return;

        if (!rawValue) {
          setState(createInitialState());
          setReady(true);
          return;
        }

        setState(hydrateState(JSON.parse(rawValue) as Partial<PersistedPomodoroState>));
      }
      catch {
        if (isMounted)
          setState(createInitialState());
      }
      finally {
        if (isMounted)
          setReady(true);
      }
    };

    void loadState();
    void ensureNotificationPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready)
      return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [ready, state]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // When the app comes back to the foreground, dismiss only our own "Still waiting"
  // notifications that accumulated while the app was backgrounded.
  useEffect(() => {
    if (Platform.OS === 'web')
      return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void dismissStillWaiting();
      }
    });

    return () => subscription.remove();
  }, []);

  const timer = useMemo(() => getTimerSnapshot(state, nowMs), [state, nowMs]);
  const summary = useMemo(() => getRecordSummary(state.records), [state.records]);
  const weekBars = useMemo(() => getWeekBars(state.records, weekAnchor), [state.records, weekAnchor]);
  const monthBars = useMemo(() => getMonthBars(state.records, yearAnchor), [state.records, yearAnchor]);

  useEffect(() => {
    if (!ready || state.phase !== 'finish')
      return;

    const timeoutId = setTimeout(() => {
      setState((currentState) => {
        const nextRecords = isCompletedRecord(currentState.currentRecord)
          ? [...currentState.records, currentState.currentRecord]
          : currentState.records;

        return {
          ...currentState,
          phase: 'ready',
          phaseStartedAt: null,
          currentRecord: createEmptyRecord(),
          records: nextRecords,
        };
      });
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [ready, state.phase]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (state.phase !== 'focus' && state.phase !== 'rest') {
      void cancelScheduled(phaseNotificationId);
      return;
    }

    let cancelled = false;

    const schedulePhaseEndReminder = async() => {
      if (Platform.OS === 'web' || !state.phaseStartedAt)
        return;

      await cancelScheduled(phaseNotificationId);

      const durationSeconds = getPhaseDurationSeconds(state.phase, state.settings);
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(state.phaseStartedAt).getTime()) / 1000));

      // Already in overtime — "Time Out!" is no longer relevant; skip scheduling.
      if (elapsedSeconds >= durationSeconds)
        return;

      const remainingSeconds = durationSeconds - elapsedSeconds;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time Out!',
          body: getNotificationBody(state.phase),
          sound: state.settings.isMuted ? undefined : 'default',
          data: { kind: NOTIFICATION_KIND_TIME_OUT },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: remainingSeconds,
        },
      });

      if (cancelled) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        catch {
        }
        return;
      }

      phaseNotificationId.current = notificationId;
    };

    void schedulePhaseEndReminder();

    return () => {
      cancelled = true;
      void cancelScheduled(phaseNotificationId);
    };
  }, [
    ready,
    state.phase,
    state.phaseStartedAt,
    state.settings,
  ]);

  useEffect(() => {
    if (!ready || !timer.isOverTime || (state.phase !== 'focus' && state.phase !== 'rest')) {
      void cancelScheduled(overtimeNotificationId);
      return;
    }

    let cancelled = false;

    const scheduleOvertimeReminder = async() => {
      if (Platform.OS === 'web')
        return;

      await cancelScheduled(overtimeNotificationId);

      const intervalSeconds = Math.max(state.settings.notificationIntervalMinutes * 60, 60);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Still waiting',
          body: getNotificationBody(state.phase),
          sound: state.settings.isMuted ? undefined : 'default',
          data: { kind: NOTIFICATION_KIND_STILL_WAITING },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalSeconds,
          repeats: true,
        },
      });

      if (cancelled) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        catch {
        }
        return;
      }

      overtimeNotificationId.current = notificationId;
    };

    void scheduleOvertimeReminder();

    return () => {
      cancelled = true;
      void cancelScheduled(overtimeNotificationId);
    };
  }, [ready, timer.isOverTime, state.phase, state.settings]);

  const updateSettings = (nextSettings: PomodoroSettings) => {
    setState(currentState => ({
      ...currentState,
      settings: {
        ...currentState.settings,
        ...nextSettings,
      },
    }));
  };

  const startFocus = (startedAt?: string) => {
    const nowIso = startedAt ?? new Date().toISOString();

    setState(currentState => ({
      ...currentState,
      phase: 'focus',
      phaseStartedAt: nowIso,
      currentRecord: {
        focus: {
          startTime: nowIso,
          endTime: '',
        },
        rest: {
          startTime: '',
          endTime: '',
        },
      },
    }));
  };

  const stopFocus = () => {
    setState(currentState => ({
      ...currentState,
      phase: 'ready',
      phaseStartedAt: null,
      currentRecord: createEmptyRecord(),
    }));
  };

  const startRest = (startedAt?: string) => {
    const nowIso = startedAt ?? new Date().toISOString();

    setState((currentState) => {
      const currentFocusStart = currentState.currentRecord.focus.startTime || nowIso;

      return {
        ...currentState,
        phase: 'rest',
        phaseStartedAt: nowIso,
        currentRecord: {
          focus: {
            startTime: currentFocusStart,
            endTime: currentState.currentRecord.focus.endTime || nowIso,
          },
          rest: {
            startTime: nowIso,
            endTime: '',
          },
        },
      };
    });
  };

  const finishRest = () => {
    const nowIso = new Date().toISOString();

    setState(currentState => ({
      ...currentState,
      phase: 'finish',
      phaseStartedAt: nowIso,
      currentRecord: {
        ...currentState.currentRecord,
        rest: {
          startTime: currentState.currentRecord.rest.startTime || nowIso,
          endTime: nowIso,
        },
      },
    }));
  };

  const stopRest = () => {
    finishRest();
  };

  return {
    ready,
    state,
    timer,
    summary,
    weekBars,
    monthBars,
    weekAnchor,
    yearAnchor,
    updateSettings,
    startFocus,
    stopFocus,
    startRest,
    stopRest,
    finishRest,
    moveWeekBackward: () => setWeekAnchor(current => current.add(-7, 'day')),
    moveWeekForward: () => setWeekAnchor(current => current.add(7, 'day')),
    moveYearBackward: () => setYearAnchor(current => current.year(current.year() - 1)),
    moveYearForward: () => setYearAnchor(current => current.year(current.year() + 1)),
  };
};