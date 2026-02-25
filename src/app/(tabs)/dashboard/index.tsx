import { Stack, useRouter } from "expo-router";
import HomeScreen from "@/components/screens/HomeScreen";

export default function DashboardRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="plus"
          onPress={() => router.push("/quick-entry")}
        />
      </Stack.Toolbar>
      <HomeScreen />
    </>
  );
}
