import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import PasswordItem from '../../components/PasswordItem';
import UpgradeModal from '../../components/UpgradeModal';
import { vaultEntryService } from '../../services/vaultEntryService';
import { categoryService } from '../../services/categoryService';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

const FREE_PLAN_LIMIT = 3;

interface PasswordEntry {
  id: string;
  domain: string;
  username: string;
  password: string;
  categoryId: string | null;
  strength: 'strong' | 'weak' | 'fair';
  strengthColor: string;
  strengthLabel: string;
}

interface Category {
  id: string;
  name: string;
}

export default function PasswordsScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const { isPro } = useAuth();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();

  const { categoryFilter: filterParam, categoryName: filterName } =
    useLocalSearchParams<{ categoryFilter?: string; categoryName?: string }>();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  useEffect(() => {
    if (filterParam) {
      setActiveCategoryFilter(filterParam);
      setActiveCategoryName(filterName || null);
    }
  }, [filterParam, filterName]);

  const [searchQuery, setSearchQuery] = useState('');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewPassText, setShowNewPassText] = useState(false);

  const handlePanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 30) {
          setSelectedPassword(null);
          setIsAddModalVisible(false);
        }
      },
    })
  ).current;

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  const fetchAll = async () => {
    try {
      const [entriesData, categoriesData] = await Promise.all([
        vaultEntryService.list(),
        categoryService.list(),
      ]);

      const cats: Category[] = Array.isArray(categoriesData)
        ? categoriesData.map((c: any) => ({ id: String(c.id), name: c.name }))
        : [];
      setCategories(cats);

      const formatted: PasswordEntry[] = (entriesData || []).map((item: any) => {
        const result = evaluatePasswordStrength(item.encrypted_secret || '', Colors);
        return {
          id: String(item.id),
          domain: item.website_url || item.title || 'Unknown',
          username: item.account_identifier,
          password: item.encrypted_secret,
          categoryId: item.category ? String(item.category) : null,
          strength: result.score >= 55 ? 'strong' : result.score >= 30 ? 'fair' : 'weak',
          strengthColor: result.color,
          strengthLabel: result.level,
        };
      });
      setPasswords(formatted);
    } catch (e) {
      console.warn('Error fetching passwords:', e);
    }
  };

  const copyToClipboard = useCallback(
    async (text: string, field: 'user' | 'pass') => {
      await Clipboard.setStringAsync(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    },
    []
  );

  const handleCreatePassword = async () => {
    if (!newDomain.trim() || !newUsername.trim() || !newPassword.trim()) {
      Alert.alert('Campos requeridos', 'Todos los campos son obligatorios');
      return;
    }

    let websiteUrl = newDomain.trim();
    if (websiteUrl && !websiteUrl.includes('.')) {
      websiteUrl = '';
    } else if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    setIsCreating(true);
    try {
      const payload: any = {
        title: newDomain,
        website_url: websiteUrl,
        account_identifier: newUsername,
        encrypted_secret: newPassword,
        notes: '',
      };
      if (newCategoryId) payload.category = newCategoryId;

      if (editingId) {
        await vaultEntryService.update(editingId, payload);
      } else {
        await vaultEntryService.create(payload);
      }

      setNewDomain('');
      setNewUsername('');
      setNewPassword('');
      setNewCategoryId(null);
      setEditingId(null);
      setIsAddModalVisible(false);
      fetchAll();
    } catch (e: any) {
      if (e?.message === 'free_plan_limit' || e?.status === 403) {
        setIsAddModalVisible(false);
        setShowUpgrade(true);
      } else {
        Alert.alert('Error', e?.message || 'No se pudo guardar la contraseña');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePassword = (id: string) => {
    Alert.alert(
      t('passwords.deleteTitle'),
      t('passwords.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await vaultEntryService.remove(id);
              setSelectedPassword(null);
              fetchAll();
            } catch (e) {
              Alert.alert('Error', t('passwords.deleteError'));
            }
          },
        },
      ]
    );
  };

  const openEditModal = (p: PasswordEntry) => {
    setEditingId(p.id);
    setNewDomain(p.domain);
    setNewUsername(p.username);
    setNewPassword(p.password);
    setNewCategoryId(p.categoryId);
    setSelectedPassword(null);
    setIsAddModalVisible(true);
  };

  const openAddModal = () => {
    if (!isPro && passwords.length >= FREE_PLAN_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    setEditingId(null);
    setNewDomain('');
    setNewUsername('');
    setNewPassword('');
    setNewCategoryId(activeCategoryFilter);
    setIsAddModalVisible(true);
  };

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch =
      p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategoryFilter || p.categoryId === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const strongCount = passwords.filter(p => p.strength === 'strong').length;
  const weakCount = passwords.filter(p => p.strength === 'weak').length;

  const newPassStrength = useMemo(() => {
    if (!newPassword) return null;
    return evaluatePasswordStrength(newPassword, Colors);
  }, [newPassword, Colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('passwords.title')}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{passwords.length}</Text>
        </View>
        {!isPro && (
          <Text style={styles.freeLabel}>{passwords.length}/{FREE_PLAN_LIMIT} gratis</Text>
        )}
      </View>

      {activeCategoryFilter && (
        <View style={styles.categoryBanner}>
          <Ionicons name="folder" size={14} color={Colors.accent} />
          <Text style={styles.categoryBannerText} numberOfLines={1}>
            {activeCategoryName || categories.find(c => c.id === activeCategoryFilter)?.name || 'Categoría'}
          </Text>
          <TouchableOpacity onPress={() => { setActiveCategoryFilter(null); setActiveCategoryName(null); }}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

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

      <View style={styles.filterRow}>
        <View style={[styles.filterTag, styles.filterTagAll]}>
          <Text style={styles.filterTagTextActive}>{t('passwords.all')} ({passwords.length})</Text>
        </View>
        <View style={styles.filterTag}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.filterTagText}>{t('passwords.strong')} ({strongCount})</Text>
        </View>
        <View style={styles.filterTag}>
          <View style={[styles.dot, { backgroundColor: Colors.error }]} />
          <Text style={styles.filterTagText}>{t('passwords.weak')} ({weakCount})</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredPasswords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('passwords.noPasswordsTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('passwords.noPasswordsSubtitle')}</Text>
          </View>
        ) : (
          filteredPasswords.map(item => (
            <PasswordItem
              key={item.id}
              domain={item.domain}
              username={item.username}
              strengthColor={item.strengthColor}
              onPress={() => {
                setSelectedPassword(item);
                setShowPassword(false);
                setCopiedField(null);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedPassword}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPassword(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandleContainer} {...handlePanResponder.panHandlers}>
              <View style={styles.modalHandle} />
            </View>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedPassword?.domain}</Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                  Contraseña guardada
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => openEditModal(selectedPassword!)}>
                  <Ionicons name="pencil" size={24} color={Colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePassword(selectedPassword!.id)}>
                  <Ionicons name="trash" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Username field */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Usuario / Email</Text>
              <View style={styles.modalValue}>
                <Text style={styles.modalValueText}>{selectedPassword?.username}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(selectedPassword?.username || '', 'user')}
                  style={styles.copyBtn}
                >
                  <Ionicons
                    name={copiedField === 'user' ? 'checkmark-circle' : 'copy-outline'}
                    size={20}
                    color={copiedField === 'user' ? Colors.success : Colors.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password field */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Contraseña</Text>
              <View style={styles.modalValue}>
                <Text style={styles.modalValueText}>
                  {showPassword ? selectedPassword?.password : '••••••••••'}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.modalActionBtn}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.accent}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(selectedPassword?.password || '', 'pass')}
                    style={styles.modalActionBtn}
                  >
                    <Ionicons
                      name={copiedField === 'pass' ? 'checkmark-circle' : 'copy-outline'}
                      size={20}
                      color={copiedField === 'pass' ? Colors.success : Colors.accent}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Strength badge */}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Seguridad</Text>
              <View
                style={[
                  styles.strengthBadge,
                  { backgroundColor: (selectedPassword?.strengthColor || Colors.success) + '22' },
                ]}
              >
                <Ionicons
                  name={selectedPassword?.strength === 'strong' ? 'shield-checkmark' : 'warning'}
                  size={16}
                  color={selectedPassword?.strengthColor || Colors.success}
                />
                <Text
                  style={[
                    styles.strengthBadgeText,
                    { color: selectedPassword?.strengthColor || Colors.success },
                  ]}
                >
                  {selectedPassword?.strengthLabel}
                </Text>
              </View>
            </View>

            {copiedField && (
              <View style={styles.copiedBanner}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[styles.copiedText, { color: Colors.success }]}>
                  ¡Copiado al portapapeles!
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '92%' }]}>
              <View style={styles.modalHandleContainer} {...handlePanResponder.panHandlers}>
                <View style={styles.modalHandle} />
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingId ? 'Editar Contraseña' : t('passwords.addModalTitle')}
                  </Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>{t('passwords.websiteLabel')}</Text>
                  <View style={styles.modalValue}>
                    <TextInput
                      style={styles.modalValueText}
                      placeholder={t('passwords.websitePlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      value={newDomain}
                      onChangeText={setNewDomain}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>{t('passwords.usernameLabel')}</Text>
                  <View style={styles.modalValue}>
                    <TextInput
                      style={styles.modalValueText}
                      placeholder={t('passwords.usernamePlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      value={newUsername}
                      onChangeText={setNewUsername}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>{t('passwords.passwordLabel')}</Text>
                  <View style={styles.modalValue}>
                    <TextInput
                      style={[styles.modalValueText, { flex: 1 }]}
                      placeholder={t('passwords.passwordPlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassText}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassText(!showNewPassText)}>
                      <Ionicons
                        name={showNewPassText ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {newPassStrength && (
                    <View style={styles.strengthRow}>
                      <View style={styles.strengthBarBg}>
                        <View
                          style={[
                            styles.strengthBarFill,
                            {
                              width: `${newPassStrength.score}%` as any,
                              backgroundColor: newPassStrength.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthHint, { color: newPassStrength.color }]}>
                        {newPassStrength.level}
                      </Text>
                    </View>
                  )}
                  {newPassStrength?.feedback ? (
                    <Text style={[styles.feedbackHint, { color: Colors.textSecondary }]}>
                      {newPassStrength.feedback}
                    </Text>
                  ) : null}
                </View>

                {/* Category picker */}
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Categoría (opcional)</Text>
                  {categories.length === 0 ? (
                    <Text style={[styles.feedbackHint, { color: Colors.textMuted, marginTop: 4 }]}>
                      Crea categorías en la pestaña Categorías
                    </Text>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                      <TouchableOpacity
                        style={[
                          styles.catChip,
                          !newCategoryId && { backgroundColor: Colors.accent + '22', borderColor: Colors.accent },
                        ]}
                        onPress={() => setNewCategoryId(null)}
                      >
                        <Text style={[styles.catChipText, !newCategoryId && { color: Colors.accent }]}>
                          Ninguna
                        </Text>
                      </TouchableOpacity>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.catChip,
                            newCategoryId === cat.id && {
                              backgroundColor: Colors.accent + '22',
                              borderColor: Colors.accent,
                            },
                          ]}
                          onPress={() => setNewCategoryId(cat.id)}
                        >
                          <Text
                            style={[
                              styles.catChipText,
                              newCategoryId === cat.id && { color: Colors.accent },
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: Colors.accent, marginTop: 10, marginBottom: 10 }]}
                  onPress={handleCreatePassword}
                  disabled={isCreating}
                >
                  <Text style={{ color: Colors.background, fontWeight: '700', textAlign: 'center', padding: 14, fontSize: 16 }}>
                    {isCreating ? t('passwords.saving') : t('passwords.savePassword')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={openAddModal}>
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (Colors: AppThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '700' },
    headerBadge: {
      backgroundColor: Colors.accentGlow,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginLeft: 10,
    },
    badgeText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
    freeLabel: {
      marginLeft: 'auto',
      color: Colors.textMuted,
      fontSize: 12,
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
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
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
    filterTagText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
    filterTagTextActive: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
    dot: { width: 6, height: 6, borderRadius: 3 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '600', marginTop: 16 },
    emptySubtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
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
      paddingTop: 10,
      paddingBottom: 40,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
    modalHandleContainer: { paddingVertical: 14, alignItems: 'center', width: '100%' },
    modalHandle: { width: 40, height: 4, backgroundColor: Colors.textMuted, borderRadius: 2 },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
    modalField: { marginBottom: 20 },
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
    modalValueText: { color: Colors.text, fontSize: 15, flex: 1 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalActionBtn: { padding: 4 },
    copyBtn: { padding: 4 },
    modalBtn: { borderRadius: 12, overflow: 'hidden' },
    strengthBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    strengthBadgeText: { fontSize: 13, fontWeight: '700' },
    copiedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
    },
    copiedText: { fontSize: 13, fontWeight: '600' },
    strengthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 8,
    },
    strengthBarBg: {
      flex: 1,
      height: 4,
      backgroundColor: Colors.inputBorder,
      borderRadius: 2,
      overflow: 'hidden',
    },
    strengthBarFill: { height: 4, borderRadius: 2 },
    strengthHint: { fontSize: 11, fontWeight: '700', minWidth: 40 },
    feedbackHint: { fontSize: 11, marginTop: 4 },
    catChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
      backgroundColor: Colors.card,
      marginRight: 8,
    },
    catChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
    categoryBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: Colors.accentGlow,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginHorizontal: 20,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.accent + '40',
    },
    categoryBannerText: {
      flex: 1,
      color: Colors.accent,
      fontSize: 13,
      fontWeight: '600',
    },
  });
