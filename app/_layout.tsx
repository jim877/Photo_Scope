import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  useEffect(() => {
    // Lock to portrait for prototype
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Orders' }} />
        <Stack.Screen name="order/[id]/index" options={{ title: 'Order' }} />
        <Stack.Screen name="order/[id]/floors" options={{ title: 'Floors' }} />
        <Stack.Screen name="order/[id]/floor/[floorId]/rooms" options={{ title: 'Rooms' }} />
        <Stack.Screen name="order/[id]/room/[roomId]/index" options={{ title: 'Room' }} />
        <Stack.Screen name="order/[id]/room/[roomId]/camera" options={{ title: 'Camera', headerShown: false }} />
        <Stack.Screen name="order/[id]/room/[roomId]/photo-review" options={{ title: 'Verify', headerShown: false }} />
      </Stack>
    </>
  );
}
