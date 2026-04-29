import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../context/SettingsContext';
import { vaultEntryService } from '../../services/vaultEntryService';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

export default function HealthScreen() {
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await vaultEntryService.list();
      setEntries(data);
    } catch (e) {
      console.warn('Error fetching entries for health:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  const healthData = useMemo(() =>
    entries.map(entry => {
      const result = evaluatePasswordStrength(entry.encrypted_secret || '', Colors);
      return {
        id: entry.id,
        title: entry.title || entry.website_url || 'Unknown',
        username: entry.account_identifier || '',
        level: result.level,
        score: result.score,
        feedback: result.feedback,
        color: result.color,
        isWeak: result.score < 55,
      };
    }),
    [entries, Colors]
  );

  const weakCount = healthData.filter(h => h.isWeak).length;
  const strongCount = healthData.filter(h => !h.isWeak).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('health.title')}</Text>
      </View>

      {entries.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: Colors.error + '50', backgroundColor: Colors.errorBg }]}>
            <Ionicons name="warning" size={20} color={Colors.error} />
            <Text style={[styles.summaryNum, { color: Colors.error }]}>{weakCount}</Text>
            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>{t('health.weak')}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.success + '50', backgroundColor: Colors.successBg }]}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={[styles.summaryNum, { color: Colors.success }]}>{strongCount}</Text>
            <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>{t('health.strong')}</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        {healthData.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t('health.noPasswords')}</Text>
          </View>
        ) : (
          healthData.map(item => (
            <View key={item.id} style={[styles.card, { borderLeftColor: item.color }]}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name={item.isWeak ? 'warning' : 'shield-checkmark'}
                  size={22}
                  color={item.color}
                />
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardUsername} numberOfLines={1}>{item.username}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: item.color + '22' }]}>
                  <Text style={[styles.levelText, { color: item.color }]}>{t(`health.level_${item.level.toLowerCase()}`)}</Text>
                </View>
              </View>

              <View style={styles.scoreRow}>
                <View style={styles.scoreBarBg}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      { width: `${item.score}%` as any, backgroundColor: item.color },
                    ]}
                  />
                </View>
                <Text style={[styles.scoreNum, { color: item.color }]}>{item.score}/100</Text>
              </View>

              {!!item.feedback && (
                <Text style={styles.feedback}>{item.feedback}</Text>
              )}
            </View>
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
      padding: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.cardBorder,
    },
    headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '700' },
    summaryRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      gap: 4,
    },
    summaryNum: { fontSize: 28, fontWeight: '800' },
    summaryLabel: { fontSize: 12, fontWeight: '600' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: Colors.textSecondary, textAlign: 'center', fontSize: 15 },
    card: {
      backgroundColor: Colors.card,
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
      borderLeftWidth: 4,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    cardTitleWrap: { flex: 1 },
    cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
    cardUsername: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    levelBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    levelText: { fontSize: 12, fontWeight: '700' },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    scoreBarBg: {
      flex: 1,
      height: 6,
      backgroundColor: Colors.inputBorder,
      borderRadius: 3,
      overflow: 'hidden',
    },
    scoreBarFill: { height: 6, borderRadius: 3 },
    scoreNum: { fontSize: 12, fontWeight: '700', minWidth: 40, textAlign: 'right' },
    feedback: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  });
