import dayjsBase from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import weekday from 'dayjs/plugin/weekday';
import en from 'dayjs/locale/en';

dayjsBase.locale({
  ...en,
  weekStart: 1,
});
dayjsBase.extend(weekday);
dayjsBase.extend(dayOfYear);

export const dayjs = dayjsBase;

export type PomodoroPhase = 'ready' | 'focus' | 'rest' | 'finish';

export interface DataRecord {
  focus: {
    startTime: string
    endTime: string
  }
  rest: {
    startTime: string
    endTime: string
  }
}

export interface PomodoroSettings {
  userName: string
  focusDurationMinutes: number
  restDurationMinutes: number
  notificationIntervalMinutes: number
  isMuted: boolean
}

export interface PersistedPomodoroState {
  phase: PomodoroPhase
  phaseStartedAt: string | null
  currentRecord: DataRecord
  records: DataRecord[]
  settings: PomodoroSettings
}

export interface TimerSnapshot {
  durationSeconds: number
  elapsedSeconds: number
  countDownSeconds: number
  countDownText: string
  durationText: string
  isOverTime: boolean
  isActive: boolean
}

export interface ChartBarDatum {
  key: string
  label: string
  count: number
}

export interface RecordSummary {
  todayCount: number
  weekCount: number
  monthCount: number
}

export const STORAGE_KEY = '@ro-pomodoro/native-state';

export const DEFAULT_SETTINGS: PomodoroSettings = {
  userName: 'Guest',
  focusDurationMinutes: 30,
  restDurationMinutes: 5,
  notificationIntervalMinutes: 1,
  isMuted: false,
};

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  ready: 'Ready State',
  focus: 'Focus State',
  rest: 'Rest State',
  finish: 'Finish State',
};

export const createEmptyRecord = (): DataRecord => ({
  focus: {
    startTime: '',
    endTime: '',
  },
  rest: {
    startTime: '',
    endTime: '',
  },
});

export const createInitialState = (): PersistedPomodoroState => ({
  phase: 'ready',
  phaseStartedAt: null,
  currentRecord: createEmptyRecord(),
  records: [],
  settings: DEFAULT_SETTINGS,
});

const isPhase = (value: unknown): value is PomodoroPhase => {
  return value === 'ready' || value === 'focus' || value === 'rest' || value === 'finish';
};

const normalizeRecord = (value?: Partial<DataRecord> | null): DataRecord => ({
  focus: {
    startTime: value?.focus?.startTime ?? '',
    endTime: value?.focus?.endTime ?? '',
  },
  rest: {
    startTime: value?.rest?.startTime ?? '',
    endTime: value?.rest?.endTime ?? '',
  },
});

export const hydrateState = (value?: Partial<PersistedPomodoroState> | null): PersistedPomodoroState => {
  const initialState = createInitialState();
  if (!value)
    return initialState;

  return {
    phase: isPhase(value.phase) ? value.phase : initialState.phase,
    phaseStartedAt: typeof value.phaseStartedAt === 'string' ? value.phaseStartedAt : null,
    currentRecord: normalizeRecord(value.currentRecord),
    records: Array.isArray(value.records) ? value.records.map(record => normalizeRecord(record)) : [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(value.settings ?? {}),
      focusDurationMinutes: Math.max(1, value.settings?.focusDurationMinutes ?? DEFAULT_SETTINGS.focusDurationMinutes),
      restDurationMinutes: Math.max(1, value.settings?.restDurationMinutes ?? DEFAULT_SETTINGS.restDurationMinutes),
      notificationIntervalMinutes: Math.max(1, value.settings?.notificationIntervalMinutes ?? DEFAULT_SETTINGS.notificationIntervalMinutes),
    },
  };
};

const pad = (value: number) => String(value).padStart(2, '0');

export const getPhaseDurationSeconds = (phase: PomodoroPhase, settings: PomodoroSettings) => {
  if (phase === 'focus')
    return settings.focusDurationMinutes * 60;
  if (phase === 'rest')
    return settings.restDurationMinutes * 60;
  return 0;
};

export const getTimerSnapshot = (state: PersistedPomodoroState, nowMs = Date.now()): TimerSnapshot => {
  const isActive = state.phase === 'focus' || state.phase === 'rest';
  const durationSeconds = getPhaseDurationSeconds(state.phase, state.settings);
  const elapsedSeconds = isActive && state.phaseStartedAt
    ? Math.max(0, Math.floor((nowMs - new Date(state.phaseStartedAt).getTime()) / 1000))
    : 0;
  const isOverTime = isActive && elapsedSeconds >= durationSeconds;
  const countDownSeconds = isActive ? Math.abs(durationSeconds - elapsedSeconds) : 0;

  return {
    durationSeconds,
    elapsedSeconds,
    countDownSeconds,
    countDownText: `${isOverTime ? '+' : ' '}${pad(Math.floor(countDownSeconds / 60))}:${pad(countDownSeconds % 60)}`,
    durationText: `${pad(Math.floor(durationSeconds / 60))}:${pad(durationSeconds % 60)}`,
    isOverTime,
    isActive,
  };
};

const getDayKey = (value?: string) => dayjs(value).format('YYYY/MM/DD');

export const isCompletedRecord = (record: DataRecord) => {
  return Boolean(
    record.focus.startTime
    && record.focus.endTime
    && record.rest.startTime
    && record.rest.endTime,
  );
};

export const getRecordSummary = (records: DataRecord[], now = dayjs()): RecordSummary => ({
  todayCount: records.filter(record => getDayKey(record.focus.startTime) === getDayKey(now.toISOString())).length,
  weekCount: records.filter(record => dayjs(record.focus.startTime).isSame(now, 'week')).length,
  monthCount: records.filter(record => dayjs(record.focus.startTime).isSame(now, 'month')).length,
});

export const getWeekBars = (records: DataRecord[], anchor = dayjs()): ChartBarDatum[] => {
  const weekStart = anchor.weekday(0);

  return Array.from({ length: 7 }, (_, index) => {
    const targetDay = weekStart.add(index, 'day');
    const label = targetDay.format('MM/DD');
    const count = records.filter(record => getDayKey(record.focus.startTime) === targetDay.format('YYYY/MM/DD')).length;

    return {
      key: targetDay.toISOString(),
      label,
      count,
    };
  });
};

export const getMonthBars = (records: DataRecord[], anchor = dayjs()): ChartBarDatum[] => {
  const year = anchor.year();

  return Array.from({ length: 12 }, (_, index) => {
    const targetMonth = anchor.month(index);
    const key = `${year}/${targetMonth.format('MM')}`;
    const count = records.filter(record => dayjs(record.focus.startTime).format('YYYY/MM') === key).length;

    return {
      key,
      label: targetMonth.format('MMM'),
      count,
    };
  });
};