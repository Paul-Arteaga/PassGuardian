import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // On Android with edge-to-edge, bottom inset = height of gesture nav bar
  const tabBarHeight = 56 + (Platform.OS === 'android' ? insets.bottom : Math.max(insets.bottom, 20));

  const tabBarStyle = useMemo(() => ({
    backgroundColor: Colors.tabBarBg,
    borderTopColor: Colors.tabBarBorder,
    borderTopWidth: 1,
    height: tabBarHeight,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'android' ? insets.bottom + 4 : Math.max(insets.bottom, 20),
    elevation: 0,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  }), [Colors, insets.bottom, tabBarHeight]);

  const styles = useMemo(() => getStyles(Colors), [Colors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="passwords"
        options={{
          title: t('tabs.passwords'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'key' : 'key-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('tabs.categories'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'folder' : 'folder-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: t('tabs.health'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'fitness' : 'fitness-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const getStyles = (Colors: AppThemeColors) =>
  StyleSheet.create({
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    tabItem: {
      paddingVertical: 4,
    },
    activeIconContainer: {
      backgroundColor: Colors.accentGlow,
      borderRadius: 10,
      padding: 6,
      marginBottom: -4,
    },
  });
