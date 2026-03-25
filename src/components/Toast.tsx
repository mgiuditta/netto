import { useEffect, useRef, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { EaseView } from "react-native-ease";
import { create } from "zustand";
import { Colors } from "@/constants/colors";

const TOAST_DURATION_MS = 2000;
const TOAST_SLIDE_OFFSET = -20;

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

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (text) {
      setMounted(true);
      setVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), TOAST_DURATION_MS);

      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [text]);

  if (!mounted || !text) return null;

  const bgColor =
    type === "error" ? Colors.loss : type === "info" ? Colors.textSecondary : Colors.primary;

  return (
    <EaseView
      style={[styles.toast, { backgroundColor: bgColor }]}
      pointerEvents="none"
      initialAnimate={{ opacity: 0, translateY: TOAST_SLIDE_OFFSET }}
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : TOAST_SLIDE_OFFSET }}
      transition={{ type: "timing", duration: visible ? 250 : 200 }}
      onTransitionEnd={({ finished }) => {
        if (finished && !visible) {
          setMounted(false);
          clear();
        }
      }}
    >
      <Text style={styles.text}>{text}</Text>
    </EaseView>
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
