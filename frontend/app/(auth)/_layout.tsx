import React from 'react';
import { Stack } from 'expo-router';
import { useAppTheme } from '../../context/SettingsContext';

export default function AuthLayout() {
  const Colors = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
