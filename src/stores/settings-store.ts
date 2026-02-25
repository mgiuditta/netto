import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const STORAGE_KEY = "netto_settings";

interface SettingsState {
  biometricEnabled: boolean;
  onboardingCompleted: boolean;
  loaded: boolean;
  toggleBiometric: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  biometricEnabled: false,
  onboardingCompleted: false,
  loaded: false,

  loadSettings: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      set({
        biometricEnabled: parsed.biometricEnabled ?? false,
        onboardingCompleted: parsed.onboardingCompleted ?? false,
        loaded: true,
      });
    } else {
      set({ loaded: true });
    }
  },

  completeOnboarding: async () => {
    set({ onboardingCompleted: true });
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const current = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, onboardingCompleted: true }),
    );
  },

  toggleBiometric: async () => {
    const current = get().biometricEnabled;

    if (!current) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return;

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Abilita blocco biometrico",
      });
      if (!result.success) return;
    }

    const next = !current;
    set({ biometricEnabled: next });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ biometricEnabled: next }),
    );
  },
}));
