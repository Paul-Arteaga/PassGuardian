import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface WelcomeCardProps {
  fullName: string;
}

export default function WelcomeCard({ fullName }: WelcomeCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 212, 255, 0.08)', 'rgba(0, 180, 216, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={28} color={Colors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Welcome back, {fullName}!
          </Text>
          <Text style={styles.subtitle}>Your vault is secure</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
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
