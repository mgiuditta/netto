import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <NativeTabs
      sidebarAdaptable
      tintColor={Colors.primary}
      labelStyle={{ color: Colors.text }}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="dashboard">
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Icon sf="clock.fill" md="history" />
        <NativeTabs.Trigger.Label>Storico</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
        <NativeTabs.Trigger.Label>Impostazioni</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
