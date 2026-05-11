import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';

// Suppress "Still waiting" banners while the user is actively using the app –
// they can already see the overtime state on screen.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const kind = notification.request.content.data?.kind;
    const isStillWaiting = kind === 'stillWaiting';
    return {
      shouldShowBanner: !isStillWaiting,
      shouldShowList: true,
      shouldPlaySound: !isStillWaiting,
      shouldSetBadge: false,
    };
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P: PressStart2P_400Regular,
  });

  if (!fontsLoaded)
    return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </>
  );
}
