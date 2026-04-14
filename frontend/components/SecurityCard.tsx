import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppThemeColors } from '../constants/Colors';
import { useAppTheme } from '../context/SettingsContext';

interface SecurityCardProps {
  icon: string;
  iconFamily?: 'ionicons' | 'material';
  value: string | number;
  label: string;
  color?: string;
}

export default function SecurityCard({ icon, iconFamily = 'ionicons', value, label, color }: SecurityCardProps) {
  const Colors = useAppTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const activeColor = color || Colors.accent;

  return (
    <View style={[styles.card, { borderColor: activeColor + '30' }]}>
      <View style={[styles.iconContainer, { backgroundColor: activeColor + '15' }]}>
        {iconFamily === 'material' ? (
          <MaterialCommunityIcons name={icon as any} size={20} color={activeColor} />
        ) : (
          <Ionicons name={icon as any} size={20} color={activeColor} />
        )}
      </View>
      <Text style={[styles.value, { color: activeColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
