import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppThemeColors } from '../../constants/Colors';
import { useAppTheme } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const Colors = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => getStyles(Colors), [Colors]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const logoScale = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const passwordStrength = evaluatePasswordStrength(password, Colors);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Min 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const success = await signUp(fullName.trim(), email.trim(), password);
      if (success) {
        router.replace('/(tabs)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (field: string) => [
    styles.inputContainer,
    focusedField === field && styles.inputContainerFocused,
    errors[field] && styles.inputContainerError,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoContainer}>
            <View style={styles.shieldOuter}>
              <LinearGradient
                colors={[Colors.accent, Colors.accentDark]}
                style={styles.shieldGradient}
              >
                <Ionicons name="shield-checkmark" size={32} color={Colors.background} />
              </LinearGradient>
            </View>
          </View>
          <Text style={styles.appName}>{t('home.appTitle')}</Text>
          <Text style={styles.appSubtitle}>{t('auth.signUpSub')}</Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View style={[styles.formCard, { opacity: formOpacity }]}>
          <Text style={styles.formTitle}>{t('auth.signUpTitle')}</Text>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('auth.nameLabel')}</Text>
            <View style={getInputStyle('fullName')}>
              <Ionicons name="person-outline" size={18} color={focusedField === 'fullName' ? Colors.accent : Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.namePlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={(t) => { setFullName(t); setErrors(e => ({ ...e, fullName: '' })); }}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('auth.emailLabel')}</Text>
            <View style={getInputStyle('email')}>
              <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? Colors.accent : Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Master Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('auth.passwordLabel')}</Text>
            <View style={getInputStyle('password')}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? Colors.accent : Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>{passwordStrength.level}</Text>
              </View>
            )}
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('auth.confirmPassword')}</Text>
            <View style={getInputStyle('confirmPassword')}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'confirmPassword' ? Colors.accent : Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirmPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: '' })); }}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text style={styles.buttonText}>{t('auth.signUpButton')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.linkText}>{t('auth.haveAccount')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>Password never stored or transmitted</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (Colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    marginBottom: 14,
  },
  shieldOuter: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  shieldGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 22,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: Colors.inputBorderFocus,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    height: '100%',
  },
  eyeIcon: {
    padding: 6,
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  strengthLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  linkAction: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
