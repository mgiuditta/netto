import { SectionList, View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { Host, Menu, Button as SwiftButton } from "@expo/ui/swift-ui";
import { Colors } from "@/constants/colors";
import { useTransactionStore } from "@/stores/transaction-store";
import { useToast } from "@/components/Toast";
import type { Transaction, TransactionCategory, TransactionType } from "@/db";

const CATEGORY_LABELS: Record<string, string> = {
  slot: "Slot",
  scommesse: "Scommesse",
  poker: "Poker",
  gratta_e_vinci: "Gratta e Vinci",
};

const TYPE_OPTIONS: { key: TransactionType | "all"; label: string }[] = [
  { key: "all", label: "Tutto" },
  { key: "win", label: "Guadagni" },
  { key: "loss", label: "Spese" },
];

const CATEGORY_OPTIONS: { key: TransactionCategory | "all"; label: string }[] = [
  { key: "all", label: "Tutte" },
  { key: "slot", label: "Slot" },
  { key: "scommesse", label: "Scommesse" },
  { key: "poker", label: "Poker" },
  { key: "gratta_e_vinci", label: "Gratta e Vinci" },
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function HistoryScreen() {
  const isLoaded = useTransactionStore((s) => s.isLoaded);
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const toast = useToast();

  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "all">("all");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, categoryFilter]);

  const sections = useMemo(() => {
    const grouped = new Map<string, { title: string; data: Transaction[] }>();
    for (const tx of filtered) {
      const key = dateKey(tx.createdAt);
      if (!grouped.has(key)) {
        grouped.set(key, { title: formatDate(tx.createdAt), data: [] });
      }
      grouped.get(key)!.data.push(tx);
    }
    return Array.from(grouped.values());
  }, [filtered]);

  const handleDelete = (tx: Transaction) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Elimina transazione", "Sei sicuro di voler eliminare questa transazione?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(tx.id);
          toast.show("Transazione eliminata");
        },
      },
    ]);
  };

  const typeLabel = TYPE_OPTIONS.find((o) => o.key === typeFilter)!.label;
  const categoryLabel = CATEGORY_OPTIONS.find((o) => o.key === categoryFilter)!.label;

  if (!isLoaded) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nessuna transazione registrata</Text>
        <Text style={styles.emptyHint}>
          Usa il pulsante + nella Dashboard per aggiungere la prima.
        </Text>
      </View>
    );
  }

  const hasActiveFilter = typeFilter !== "all" || categoryFilter !== "all";

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      style={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        <View style={styles.filtersContainer}>
          <Host style={styles.menuHost}>
            <Menu label={typeLabel} systemImage="arrow.up.arrow.down">
              {TYPE_OPTIONS.map((o) => (
                <SwiftButton
                  key={o.key}
                  label={o.label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTypeFilter(o.key);
                  }}
                />
              ))}
            </Menu>
          </Host>
          <Host style={styles.menuHost}>
            <Menu label={categoryLabel} systemImage="square.grid.2x2">
              {CATEGORY_OPTIONS.map((o) => (
                <SwiftButton
                  key={o.key}
                  label={o.label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategoryFilter(o.key);
                  }}
                />
              ))}
            </Menu>
          </Host>
        </View>
      }
      ListEmptyComponent={
        hasActiveFilter ? (
          <View style={styles.emptyFilter}>
            <Text style={styles.emptyText}>Nessun risultato per i filtri selezionati</Text>
          </View>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity onLongPress={() => handleDelete(item)} delayLongPress={400}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.type === "win" ? Colors.win : Colors.loss },
              ]}
            >
              {item.type === "win" ? "+" : "−"}€{formatAmount(item.amount)}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  menuHost: {
    flex: 1,
    height: 36,
    minWidth: 160,
  },
  emptyFilter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 2,
    borderRadius: 10,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});
