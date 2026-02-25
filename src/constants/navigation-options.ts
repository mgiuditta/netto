import { Colors } from "@/constants/colors";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export function useLargeHeaderOptions(): NativeStackNavigationOptions {
  const isGlassAvailable = isLiquidGlassAvailable();

  return {
    headerTintColor: Colors.text,
    headerTransparent: true,
    headerBlurEffect: !isGlassAvailable ? "dark" : undefined,
    headerLargeStyle: {
      backgroundColor: "transparent",
    },
    headerLargeTitle: true,
  };
}
