import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nativeColors, lightColors, darkColors, AppThemeColors } from '../constants/Colors';
import '../utils/i18n';
import { useTranslation } from 'react-i18next';

export type ThemeType = 'native' | 'light' | 'dark';
export type LanguageType = 'en' | 'es';

interface SettingsContextData {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  colors: AppThemeColors;
}

const SettingsContext = createContext<SettingsContextData>({} as SettingsContextData);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('native');
  const [language, setLanguageState] = useState<LanguageType>('en');
  const { i18n } = useTranslation();

  const colors = 
    theme === 'native' ? nativeColors :
    theme === 'light' ? lightColors :
    darkColors;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('app_theme');
        if (storedTheme === 'native' || storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
        }

        const storedLanguage = await AsyncStorage.getItem('app_language');
        if (storedLanguage === 'en' || storedLanguage === 'es') {
          setLanguageState(storedLanguage);
          i18n.changeLanguage(storedLanguage);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    loadSettings();
  }, [i18n]);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const setLanguage = async (newLanguage: LanguageType) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, colors }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export const useAppTheme = () => {
  const { colors } = useSettings();
  return colors;
};
