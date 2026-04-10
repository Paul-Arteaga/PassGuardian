import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

interface SettingItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  iconColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingItem({ icon, label, subtitle, iconColor = Colors.accent, onPress, rightElement, danger }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, danger && { color: Colors.error }]}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="finger-print"
            label="Biometric Unlock"
            subtitle="Use Face ID or Touch ID"
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: Colors.inputBorder, true: Colors.accent + '60' }}
                thumbColor={biometricEnabled ? Colors.accent : Colors.textMuted}
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="timer-outline"
            label="Auto-Lock"
            subtitle="Lock after 5 minutes"
            rightElement={
              <Switch
                value={autoLockEnabled}
                onValueChange={setAutoLockEnabled}
                trackColor={{ false: Colors.inputBorder, true: Colors.accent + '60' }}
                thumbColor={autoLockEnabled ? Colors.accent : Colors.textMuted}
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="key-outline"
            label="Change Master Password"
          />
        </View>

        {/* General Section */}
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="cloud-download-outline"
            label="Export Passwords"
            subtitle="Download as encrypted file"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="cloud-upload-outline"
            label="Import Passwords"
            subtitle="From CSV or other managers"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="notifications-outline"
            label="Notifications"
            iconColor={Colors.warning}
          />
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="information-circle-outline"
            label="Version"
            subtitle="1.0.0"
            iconColor={Colors.textSecondary}
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            label="Privacy Policy"
            iconColor={Colors.textSecondary}
          />
        </View>

        {/* Logout */}
        <View style={[styles.sectionCard, { marginTop: 20 }]}>
          <SettingItem
            icon="log-out-outline"
            label="Sign Out"
            iconColor={Colors.error}
            danger
            onPress={handleLogout}
          />
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginLeft: 66,
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  footerSpace: {
    height: 20,
  },
});
