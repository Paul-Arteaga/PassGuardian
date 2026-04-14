import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import PasswordItem from '../../components/PasswordItem';

interface PasswordEntry {
  id: string;
  domain: string;
  username: string;
  password: string;
  strength: string;
}

const INITIAL_PASSWORDS: PasswordEntry[] = [
  { id: '1', domain: 'github.com', username: 'developer@example.com', password: 'Gh!tHub2024$', strength: 'strong' },
  { id: '2', domain: 'gmail.com', username: 'user@gmail.com', password: 'Gm@il_Secure99', strength: 'strong' },
  { id: '3', domain: 'linkedin.com', username: 'professional@gmail.com', password: 'link123', strength: 'weak' },
];

export default function PasswordsScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [passwords, setPasswords] = useState(INITIAL_PASSWORDS);
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const filteredPasswords = passwords.filter(
    p => p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const strongCount = passwords.filter(p => p.strength === 'strong').length;
  const weakCount = passwords.filter(p => p.strength === 'weak').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('passwords.title')}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{passwords.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('passwords.search')}
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tags */}
      <View style={styles.filterRow}>
        <View style={[styles.filterTag, styles.filterTagAll]}>
          <Text style={styles.filterTagTextActive}>{t('passwords.all')} ({passwords.length})</Text>
        </View>
        <View style={styles.filterTag}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.filterTagText}>{t('passwords.strong')} ({strongCount})</Text>
        </View>
        <View style={styles.filterTag}>
          <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.filterTagText}>{t('passwords.weak')} ({weakCount})</Text>
        </View>
      </View>

      {/* Password List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPasswords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No passwords found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          filteredPasswords.map((item) => (
            <PasswordItem
              key={item.id}
              domain={item.domain}
              username={item.username}
              onPress={() => { setSelectedPassword(item); setShowPassword(false); }}
            />
          ))
        )}
      </ScrollView>

      {/* Password Detail Modal */}
      <Modal
        visible={!!selectedPassword}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPassword(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPassword?.domain}</Text>
              <TouchableOpacity onPress={() => setSelectedPassword(null)}>
                <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Username / Email</Text>
              <View style={styles.modalValue}>
                <Text style={styles.modalValueText}>{selectedPassword?.username}</Text>
                <TouchableOpacity>
                  <Ionicons name="copy-outline" size={20} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Password</Text>
              <View style={styles.modalValue}>
                <Text style={styles.modalValueText}>
                  {showPassword ? selectedPassword?.password : '••••••••••'}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.modalActionBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn}>
                    <Ionicons name="copy-outline" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Strength</Text>
              <View style={[styles.strengthBadge, {
                backgroundColor: selectedPassword?.strength === 'strong' ? Colors.successBg : Colors.warningBg
              }]}>
                <Text style={[styles.strengthBadgeText, {
                  color: selectedPassword?.strength === 'strong' ? Colors.success : Colors.warning
                }]}>
                  {selectedPassword?.strength === 'strong' ? '🛡 Strong' : '⚠️ Weak'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: Colors.accentGlow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 10,
  },
  badgeText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 5,
  },
  filterTagAll: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.accent + '40',
  },
  filterTagText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTagTextActive: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: 14,
  },
  modalValueText: {
    color: Colors.text,
    fontSize: 15,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    padding: 4,
  },
  strengthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  strengthBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
