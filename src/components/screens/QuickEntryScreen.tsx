import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { useTransactionStore } from "@/stores/transaction-store";
import type { TransactionType, TransactionCategory } from "@/db";

const CATEGORIES: { key: TransactionCategory; label: string }[] = [
  { key: "gratta_e_vinci", label: "Gratta e Vinci" },
  { key: "slot", label: "Slot" },
  { key: "scommesse", label: "Scommesse" },
  { key: "poker", label: "Poker" },
];

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];

function formatAmount(euroDigits: string, centDigits: string, hasCents: boolean): string {
  const euros = euroDigits || "0";
  if (!hasCents) return `€ ${euros}`;
  return `€ ${euros},${centDigits.padEnd(2, "0")}`;
}

function toCents(euroDigits: string, centDigits: string): number {
  const euros = parseInt(euroDigits || "0", 10);
  const cents = parseInt(centDigits.padEnd(2, "0").slice(0, 2), 10);
  return euros * 100 + cents;
}

export default function QuickEntryScreen() {
  const router = useRouter();
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  const [type, setType] = useState<TransactionType>("loss");
  const [euroDigits, setEuroDigits] = useState("");
  const [centDigits, setCentDigits] = useState("");
  const [hasCents, setHasCents] = useState(false);
  const [category, setCategory] = useState<TransactionCategory>("gratta_e_vinci");

  const handleKey = (key: string) => {
    if (key === "⌫") {
      if (hasCents) {
        if (centDigits.length > 0) {
          setCentDigits((d) => d.slice(0, -1));
        } else {
          setHasCents(false);
        }
      } else {
        setEuroDigits((d) => d.slice(0, -1));
      }
    } else if (key === ",") {
      if (!hasCents) setHasCents(true);
    } else {
      if (hasCents) {
        setCentDigits((d) => (d.length < 2 ? d + key : d));
      } else {
        setEuroDigits((d) => (d.length < 6 ? d + key : d));
      }
    }
  };

  const amountCents = toCents(euroDigits, centDigits);

  const handleConfirm = async () => {
    if (amountCents === 0) return;
    await addTransaction(amountCents, type, category);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Toggle GUADAGNO / SPESA */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "win" && styles.toggleWinActive]}
          onPress={() => setType("win")}
        >
          <Text
            style={[
              styles.toggleText,
              type === "win" && styles.toggleTextActive,
            ]}
          >
            GUADAGNO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "loss" && styles.toggleLossActive]}
          onPress={() => setType("loss")}
        >
          <Text
            style={[
              styles.toggleText,
              type === "loss" && styles.toggleTextActive,
            ]}
          >
            SPESA
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount display */}
      <Text style={[styles.amount, { color: type === "win" ? Colors.win : Colors.loss }]}>
        {formatAmount(euroDigits, centDigits, hasCents)}
      </Text>

      {/* Category chips */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoriesList}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.chip, category === c.key && styles.chipActive]}
            onPress={() => setCategory(c.key)}
          >
            <Text
              style={[
                styles.chipText,
                category === c.key && styles.chipTextActive,
              ]}
              numberOfLines={1}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Numeric keypad */}
      <View style={styles.keypad}>
        {KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => handleKey(key)}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Confirm button */}
      <TouchableOpacity
        style={[styles.confirmBtn, amountCents === 0 && styles.confirmBtnDisabled]}
        onPress={handleConfirm}
        disabled={amountCents === 0}
      >
        <Text style={styles.confirmText}>Conferma</Text>
      </TouchableOpacity>
    </View>
  );
}

const KEY_GAP = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  toggle: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  toggleWinActive: {
    backgroundColor: Colors.win,
  },
  toggleLossActive: {
    backgroundColor: Colors.loss,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: Colors.text,
  },
  amount: {
    fontSize: 44,
    fontWeight: "700",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    marginBottom: 20,
  },
  categoriesList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  categories: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  chipTextActive: {
    color: Colors.text,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: KEY_GAP,
  },
  key: {
    flexBasis: "31%",
    flexGrow: 1,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});
