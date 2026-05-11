import { AppState, Platform } from 'react-native';
import { useEffect, useRef } from 'react';

import { clearPendingAction, getPendingAction, getWidgetState } from '../../../modules/widget-bridge';

interface ControllerActions {
  startFocus: (startedAt?: string) => void
  stopFocus: () => void
  startRest: (startedAt?: string) => void
  finishRest: () => void
}

const applyPendingAction = async (actions: ControllerActions) => {
  const pending = await getPendingAction();
  if (!pending)
    return;

  // For start actions, read the widget's stored phaseStartedAt so both timers
  // show the same countdown (the widget set the clock when the button was tapped).
  // Read BEFORE clearing so we don't race with another widget tap that overwrites
  // widgetState between getPendingAction and getWidgetState.
  let widgetStartedAt: string | undefined;
  if (pending === 'startFocus' || pending === 'startRest') {
    const widgetState = await getWidgetState();
    widgetStartedAt = widgetState?.phaseStartedAt ?? undefined;
  }

  await clearPendingAction();

  switch (pending) {
    case 'startFocus':
      actions.startFocus(widgetStartedAt);
      break;
    case 'stopFocus':
      actions.stopFocus();
      break;
    case 'startRest':
      actions.startRest(widgetStartedAt);
      break;
    case 'finishRest':
      actions.finishRest();
      break;
  }
};

export const useWidgetActionHandler = (actions: ControllerActions, ready: boolean) => {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    if (Platform.OS !== 'ios' || !ready)
      return;

    const run = () => { void applyPendingAction(actionsRef.current); };

    // Apply any pending action from a widget intent once state is loaded
    run();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active')
        run();
    });

    return () => subscription.remove();
  }, [ready]);
};
