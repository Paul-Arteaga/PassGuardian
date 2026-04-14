import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors, theme } = useSettings();

  return (
    <>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SettingsProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </SettingsProvider>
  );
}
