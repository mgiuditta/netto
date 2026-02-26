import { Stack, useRouter } from "expo-router";
import HistoryScreen from "@/components/screens/HistoryScreen";
import { Colors } from "@/constants/colors";

export default function HistoryRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="plus"
          tintColor={Colors.primary}
          onPress={() => router.push("/quick-entry")}
        />
      </Stack.Toolbar>
      <HistoryScreen />
    </>
  );
}
