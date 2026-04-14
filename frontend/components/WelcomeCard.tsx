import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { AppThemeColors } from '../constants/Colors';

interface WelcomeCardProps {
  fullName: string;
}

export default function WelcomeCard({ fullName }: WelcomeCardProps) {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.accentGlowStrong, Colors.accentGlow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={28} color={Colors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {t('home.welcome')}, {fullName}!
          </Text>
          <Text style={styles.subtitle}>{t('home.appSubtitle')}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
    overflow: 'hidden',
    marginBottom: 24,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
