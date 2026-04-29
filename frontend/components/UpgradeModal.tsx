import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/SettingsContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ visible, onClose }: Props) {
  const Colors = useAppTheme();

  const features = [
    'Contraseñas ilimitadas',
    'Análisis de salud avanzado',
    'Categorías ilimitadas',
    'Acceso de por vida',
    'Sin suscripción mensual',
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.badge, { backgroundColor: Colors.accent + '20' }]}>
            <Ionicons name="star" size={16} color={Colors.accent} />
            <Text style={[styles.badgeText, { color: Colors.accent }]}>PRO</Text>
          </View>

          <Text style={[styles.title, { color: Colors.text }]}>Actualiza a Pro</Text>
          <Text style={[styles.price, { color: Colors.accent }]}>$1</Text>
          <Text style={[styles.priceNote, { color: Colors.textSecondary }]}>pago único — de por vida</Text>

          <View style={styles.divider} />

          {/* Features */}
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={[styles.featureText, { color: Colors.text }]}>{f}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={[styles.limitText, { color: Colors.textSecondary }]}>
            Plan gratuito: máximo 3 contraseñas guardadas.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: Colors.accent }]}
            onPress={() => {
              // Replace this URL with your actual payment link (e.g. Stripe, Gumroad)
              Linking.openURL('https://passguardian.duckdns.org');
            }}
          >
            <Ionicons name="flash" size={18} color={Colors.background} />
            <Text style={[styles.buyBtnText, { color: Colors.background }]}>
              Obtener Pro — $1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.cancelText, { color: Colors.textSecondary }]}>
              Continuar con plan gratuito
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
    borderWidth: 1,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: '900',
  },
  priceNote: {
    fontSize: 14,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 15,
  },
  limitText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  buyBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
  },
});
