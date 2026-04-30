import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../context/SettingsContext';
import { categoryService } from '../../services/categoryService';

const FOLDER_COLORS = ['#00d4ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CategoriesScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.warn('Error fetching categories:', e);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la categoría no puede estar vacío.');
      return;
    }
    setIsCreating(true);
    try {
      await categoryService.create({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      });
      setNewCategoryName('');
      setNewCategoryDesc('');
      await fetchCategories();
    } catch (e: any) {
      const msg = e?.message || 'No se pudo crear la categoría';
      // Friendlier message for duplicate name
      if (msg.includes('unique') || msg.includes('already') || msg.includes('exist')) {
        Alert.alert('Nombre duplicado', 'Ya tienes una categoría con ese nombre.');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (cat: any) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Eliminar "${cat.name}"? Las contraseñas asignadas quedarán sin categoría.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.remove(cat.id);
              await fetchCategories();
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('categories.title')}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>{categories.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        {/* Create form */}
        <View style={styles.createCard}>
          <Text style={styles.cardTitle}>{t('categories.newCategory')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('categories.name')}
            placeholderTextColor={Colors.textMuted}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            maxLength={80}
          />
          <TextInput
            style={styles.input}
            placeholder={t('categories.description')}
            placeholderTextColor={Colors.textMuted}
            value={newCategoryDesc}
            onChangeText={setNewCategoryDesc}
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.btn, isCreating && styles.btnDisabled]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <Text style={styles.btnText}>{t('categories.create')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('categories.yourCategories')}</Text>

        {isLoading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aún no tienes categorías</Text>
          </View>
        ) : (
          categories.map((cat: any, idx: number) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              activeOpacity={0.7}
              onPress={() =>
                router.navigate({
                  pathname: '/(tabs)/passwords',
                  params: { categoryFilter: String(cat.id), categoryName: cat.name },
                })
              }
            >
              <View
                style={[
                  styles.folderIcon,
                  { backgroundColor: FOLDER_COLORS[idx % FOLDER_COLORS.length] + '22' },
                ]}
              >
                <Ionicons
                  name="folder"
                  size={22}
                  color={FOLDER_COLORS[idx % FOLDER_COLORS.length]}
                />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                {!!cat.description && (
                  <Text style={styles.categoryDesc}>{cat.description}</Text>
                )}
                <Text style={styles.categoryHint}>Toca para ver contraseñas</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(cat)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.cardBorder,
    },
    headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '700', flex: 1 },
    headerBadge: {
      backgroundColor: Colors.accentGlow,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    badgeText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    createCard: {
      backgroundColor: Colors.card,
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
    cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', marginBottom: 14 },
    input: {
      backgroundColor: Colors.inputBg,
      color: Colors.text,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.inputBorder,
      fontSize: 15,
    },
    btn: {
      backgroundColor: Colors.accent,
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: Colors.background, fontWeight: '700', fontSize: 15 },
    sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
    emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
    emptyText: { color: Colors.textSecondary, fontSize: 14 },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.card,
      padding: 14,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
      gap: 12,
    },
    folderIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryInfo: { flex: 1 },
    categoryName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
    categoryDesc: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
    categoryHint: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
    deleteBtn: { padding: 4 },
  });
