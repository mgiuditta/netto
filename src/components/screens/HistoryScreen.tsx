import { SectionList, View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/colors";
import { useTransactionStore } from "@/stores/transaction-store";
import type { Transaction } from "@/db";

const CATEGORY_LABELS: Record<string, string> = {
  slot: "Slot",
  scommesse: "Scommesse",
  poker: "Poker",
  gratta_e_vinci: "Gratta e Vinci",
};

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
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  const sections = useMemo(() => {
    const grouped = new Map<string, { title: string; data: Transaction[] }>();
    for (const tx of transactions) {
      const key = dateKey(tx.createdAt);
      if (!grouped.has(key)) {
        grouped.set(key, { title: formatDate(tx.createdAt), data: [] });
      }
      grouped.get(key)!.data.push(tx);
    }
    return Array.from(grouped.values());
  }, [transactions]);

  const handleDelete = (tx: Transaction) => {
    Alert.alert("Elimina transazione", "Sei sicuro di voler eliminare questa transazione?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => deleteTransaction(tx.id),
      },
    ]);
  };

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

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      style={styles.list}
      contentInsetAdjustmentBehavior="automatic"
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
