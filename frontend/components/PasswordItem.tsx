import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppThemeColors } from '../constants/Colors';
import { useAppTheme } from '../context/SettingsContext';

interface PasswordItemProps {
  domain: string;
  username: string;
  onPress?: () => void;
}

export default function PasswordItem({ domain, username, onPress }: PasswordItemProps) {
  const Colors = useAppTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  
  const getDomainColor = (d: string) => {
    const colors = ['#00d4ff', '#22c55e', '#8b5cf6', '#f59e0b', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < d.length; i++) {
      hash = d.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const color = getDomainColor(domain);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20', borderColor: color + '40' }]}>
        <Ionicons name="globe-outline" size={22} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.domain}>{domain}</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  domain: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  username: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
