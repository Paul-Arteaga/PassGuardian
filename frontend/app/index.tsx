import React, { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/SettingsContext';
import { AppThemeColors } from '../constants/Colors';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const Colors = useAppTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/sign-up');
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.accent} />
    </View>
  );
}

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
