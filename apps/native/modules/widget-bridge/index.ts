import { Platform } from 'react-native';

export interface WidgetState {
  phase: string;
  phaseStartedAt: string | null;
  focusDurationMinutes: number;
  restDurationMinutes: number;
}

let nativeModule: {
  syncWidgetState: (json: string) => Promise<void>;
  getPendingAction: () => Promise<string | null>;
  clearPendingAction: () => Promise<void>;
  getWidgetState: () => Promise<string | null>;
} | null = null;

if (Platform.OS === 'ios') {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    nativeModule = requireNativeModule('WidgetBridge');
  }
  catch {
    // not available in Expo Go or simulator without native build
  }
}

export const syncWidgetState = (state: WidgetState): Promise<void> => {
  if (!nativeModule)
    return Promise.resolve();
  return nativeModule.syncWidgetState(JSON.stringify(state));
};

export const getPendingAction = (): Promise<string | null> => {
  if (!nativeModule)
    return Promise.resolve(null);
  return nativeModule.getPendingAction();
};

export const clearPendingAction = (): Promise<void> => {
  if (!nativeModule)
    return Promise.resolve();
  return nativeModule.clearPendingAction();
};

export const getWidgetState = async (): Promise<WidgetState | null> => {
  if (!nativeModule)
    return null;
  const json = await nativeModule.getWidgetState();
  if (!json)
    return null;
  try {
    return JSON.parse(json) as WidgetState;
  }
  catch {
    return null;
  }
};
