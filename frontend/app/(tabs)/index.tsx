import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import WelcomeCard from '../../components/WelcomeCard';
import SecurityCard from '../../components/SecurityCard';
import PasswordItem from '../../components/PasswordItem';
import { vaultEntryService } from '../../services/vaultEntryService';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

export default function HomeScreen() {
  const { user } = useAuth();
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  const fullName = user?.fullName || 'User';

  const [passwords, setPasswords] = useState<any[]>([]);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const data = await vaultEntryService.list();
      const formatted = data.map((item: any) => {
        const result = evaluatePasswordStrength(item.encrypted_secret || '', Colors);
        return {
          id: item.id.toString(),
          domain: item.website_url || item.title || 'Unknown',
          username: item.account_identifier,
          strength: result.score >= 55 ? 'strong' : 'weak',
        };
      });
      setPasswords(formatted);
    } catch (e) {
      console.warn("Error fetching passwords:", e);
    }
  };

  const totalPasswords = passwords.length;
  const strongPasswords = passwords.filter(p => p.strength === 'strong').length;
  const weakPasswords = passwords.filter(p => p.strength === 'weak').length;
  const securityScore = totalPasswords > 0
    ? Math.round((strongPasswords / totalPasswords) * 100)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{t('home.appTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('home.appSubtitle')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => router.push('/(tabs)/passwords')}>
          <Ionicons name="add" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <WelcomeCard fullName={fullName} />

        {/* Security Overview */}
        <Text style={styles.sectionTitle}>{t('home.securityOverview')}</Text>
        <View style={styles.gridRow}>
          <SecurityCard
            icon="key-outline"
            value={totalPasswords}
            label={t('home.total')}
            color={Colors.accent}
          />
          <View style={styles.gridGap} />
          <SecurityCard
            icon="shield-checkmark-outline"
            value={strongPasswords}
            label={t('home.strong')}
            color={Colors.success}
          />
        </View>
        <View style={styles.gridRow}>
          <SecurityCard
            icon="warning-outline"
            value={weakPasswords}
            label={t('home.weak')}
            color={Colors.warning}
          />
          <View style={styles.gridGap} />
          <SecurityCard
            icon="trending-up"
            iconFamily="ionicons"
            value={`${securityScore}%`}
            label={t('home.score')}
            color="#8b5cf6"
          />
        </View>

        {/* Recent Passwords */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('home.recentPasswords')}</Text>
        {passwords.map((item) => (
          <PasswordItem
            key={item.id}
            domain={item.domain}
            username={item.username}
          />
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gridGap: {
    width: 12,
  },
});
