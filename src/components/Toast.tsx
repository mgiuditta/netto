import { useEffect, useRef, useCallback } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { create } from "zustand";
import { Colors } from "@/constants/colors";

type ToastType = "success" | "error" | "info";

interface ToastState {
  text: string | null;
  type: ToastType;
  show: (text: string, type?: ToastType) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  text: null,
  type: "success",
  show: (text, type = "success") => set({ text, type }),
  clear: () => set({ text: null }),
}));

export const useToast = () => {
  const show = useToastStore((s) => s.show);
  return { show };
};

export function ToastOverlay() {
  const text = useToastStore((s) => s.text);
  const type = useToastStore((s) => s.type);
  const clear = useToastStore((s) => s.clear);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => clear());
  }, [opacity, translateY, clear]);

  useEffect(() => {
    if (!text) return;

    opacity.setValue(0);
    translateY.setValue(-20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(hide, 2000);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, opacity, translateY, hide]);

  if (!text) return null;

  const bgColor =
    type === "error" ? Colors.loss : type === "info" ? Colors.textSecondary : Colors.primary;

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: bgColor, opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 64,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 9999,
  },
  text: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
