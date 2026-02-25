import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Colors } from "@/constants/colors";
import { initDatabase } from "@/db";
import { useTransactionStore } from "@/stores/transaction-store";
import { useSettingsStore } from "@/stores/settings-store";
import OnboardingScreen from "@/components/screens/OnboardingScreen";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadStats = useTransactionStore((s) => s.loadStats);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const settingsLoaded = useSettingsStore((s) => s.loaded);

  useEffect(() => {
    async function init() {
      await initDatabase();
      await loadSettings();
      await loadTransactions();
      await loadStats();
      setDbReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!dbReady || !settingsLoaded || !onboardingCompleted) return;

    if (!biometricEnabled) {
      setAuthenticated(true);
      return;
    }

    LocalAuthentication.authenticateAsync({
      promptMessage: "Sblocca Netto",
    }).then((result) => {
      if (result.success) setAuthenticated(true);
    });
  }, [dbReady, settingsLoaded, biometricEnabled, onboardingCompleted]);

  if (!dbReady) return null;

  if (!onboardingCompleted) return <OnboardingScreen />;

  if (!authenticated) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="quick-entry"
        options={{
          presentation: "modal",
          title: "Quick Entry",
        }}
      />
    </Stack>
  );
}
