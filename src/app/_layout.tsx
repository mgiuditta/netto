import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";
import { initDatabase } from "@/db";
import { useTransactionStore } from "@/stores/transaction-store";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadStats = useTransactionStore((s) => s.loadStats);

  useEffect(() => {
    async function init() {
      await initDatabase();
      await loadTransactions();
      await loadStats();
      setDbReady(true);
    }
    init();
  }, []);

  if (!dbReady) return null;

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
