import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const STORAGE_KEY = "netto_settings";

interface PersistedSettings {
  biometricEnabled?: boolean;
  onboardingCompleted?: boolean;
}

function parseSettings(raw: string): PersistedSettings {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) return {};
  const obj = parsed as Record<string, unknown>;
  return {
    biometricEnabled: typeof obj.biometricEnabled === "boolean" ? obj.biometricEnabled : undefined,
    onboardingCompleted: typeof obj.onboardingCompleted === "boolean" ? obj.onboardingCompleted : undefined,
  };
}

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
      const settings = parseSettings(raw);
      set({
        biometricEnabled: settings.biometricEnabled ?? false,
        onboardingCompleted: settings.onboardingCompleted ?? false,
        loaded: true,
      });
    } else {
      set({ loaded: true });
    }
  },

  completeOnboarding: async () => {
    set({ onboardingCompleted: true });
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const current = raw ? parseSettings(raw) : {};
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
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved = raw ? parseSettings(raw) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...saved, biometricEnabled: next }),
    );
  },
}));
