import React from 'react';
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
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import WelcomeCard from '../../components/WelcomeCard';
import SecurityCard from '../../components/SecurityCard';
import PasswordItem from '../../components/PasswordItem';

const MOCK_PASSWORDS = [
  { id: '1', domain: 'github.com', username: 'developer@example.com', strength: 'strong' },
  { id: '2', domain: 'gmail.com', username: 'user@gmail.com', strength: 'strong' },
  { id: '3', domain: 'linkedin.com', username: 'professional@gmail.com', strength: 'weak' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const fullName = user?.fullName || 'User';

  const totalPasswords = MOCK_PASSWORDS.length;
  const strongPasswords = MOCK_PASSWORDS.filter(p => p.strength === 'strong').length;
  const weakPasswords = MOCK_PASSWORDS.filter(p => p.strength === 'weak').length;
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
            <Text style={styles.headerTitle}>PassGuardian</Text>
            <Text style={styles.headerSubtitle}>Secure Vault</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
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
        <Text style={styles.sectionTitle}>Security Overview</Text>
        <View style={styles.gridRow}>
          <SecurityCard
            icon="key-outline"
            value={totalPasswords}
            label="Total"
            color={Colors.accent}
          />
          <View style={styles.gridGap} />
          <SecurityCard
            icon="shield-checkmark-outline"
            value={strongPasswords}
            label="Strong"
            color={Colors.success}
          />
        </View>
        <View style={styles.gridRow}>
          <SecurityCard
            icon="warning-outline"
            value={weakPasswords}
            label="Weak"
            color={Colors.warning}
          />
          <View style={styles.gridGap} />
          <SecurityCard
            icon="trending-up"
            iconFamily="ionicons"
            value={`${securityScore}%`}
            label="Score"
            color="#8b5cf6"
          />
        </View>

        {/* Recent Passwords */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Passwords</Text>
        {MOCK_PASSWORDS.map((item) => (
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

const styles = StyleSheet.create({
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
