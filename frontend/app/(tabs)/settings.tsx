import React, { useState, useMemo } from 'react';
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
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme, useSettings } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
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

function SettingItem({ icon, label, subtitle, iconColor, onPress, rightElement, danger }: SettingItemProps) {
  const Colors = useAppTheme();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const activeIconColor = iconColor || Colors.accent;

  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: activeIconColor + '15' }]}>
        <Ionicons name={icon as any} size={20} color={activeIconColor} />
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
  const { theme, setTheme, language, setLanguage } = useSettings();
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirm'),
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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.security')}</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="finger-print"
            label={t('settings.biometric')}
            subtitle={t('settings.biometricSub')}
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
            label={t('settings.autoLock')}
            subtitle={t('settings.autoLockSub')}
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
            label={t('settings.masterPassword')}
          />
        </View>

        {/* General Section */}
        <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="cloud-download-outline"
            label={t('settings.export')}
            subtitle={t('settings.exportSub')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="cloud-upload-outline"
            label={t('settings.import')}
            subtitle={t('settings.importSub')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="notifications-outline"
            label={t('settings.notifications')}
            iconColor={Colors.warning}
          />
        </View>

        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="language-outline"
            label={t('settings.language')}
            rightElement={
              <View style={styles.toggleGroup}>
                <TouchableOpacity onPress={() => setLanguage('en')} style={[styles.toggleBtn, language === 'en' && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleBtnText, language === 'en' && styles.toggleBtnTextActive]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setLanguage('es')} style={[styles.toggleBtn, language === 'es' && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleBtnText, language === 'es' && styles.toggleBtnTextActive]}>ES</Text>
                </TouchableOpacity>
              </View>
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="color-palette-outline"
            label={t('settings.theme')}
            rightElement={
              <View style={styles.toggleGroup}>
                <TouchableOpacity onPress={() => setTheme('native')} style={[styles.toggleBtn, theme === 'native' && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleBtnText, theme === 'native' && styles.toggleBtnTextActive]}>Blue</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTheme('dark')} style={[styles.toggleBtn, theme === 'dark' && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleBtnText, theme === 'dark' && styles.toggleBtnTextActive]}>Dark</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTheme('light')} style={[styles.toggleBtn, theme === 'light' && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleBtnText, theme === 'light' && styles.toggleBtnTextActive]}>Light</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="information-circle-outline"
            label={t('settings.version')}
            subtitle="1.0.0"
            iconColor={Colors.textSecondary}
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            label={t('settings.privacy')}
            iconColor={Colors.textSecondary}
          />
        </View>

        {/* Logout */}
        <View style={[styles.sectionCard, { marginTop: 20 }]}>
          <SettingItem
            icon="log-out-outline"
            label={t('settings.signOut')}
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

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
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
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: Colors.inputBorder,
  },
  toggleBtnActive: {
    backgroundColor: Colors.accentGlow,
  },
  toggleBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: Colors.accent,
  },
});
