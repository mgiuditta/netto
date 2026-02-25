import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Colors } from "@/constants/colors";
import { useTransactionStore } from "@/stores/transaction-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { TransactionCategory } from "@/db";

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  slot: "Slot",
  scommesse: "Scommesse",
  poker: "Poker",
  gratta_e_vinci: "Gratta e Vinci",
};

export default function SettingsScreen() {
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteAllTransactions = useTransactionStore((s) => s.deleteAllTransactions);
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const toggleBiometric = useSettingsStore((s) => s.toggleBiometric);

  const lossByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "loss") {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    }
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return { map, total };
  }, [transactions]);

  const handleTipJar = () => {
    Linking.openURL("https://buymeacoffee.com/netto");
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Cancella tutti i dati",
      "Questa azione è irreversibile. Tutte le transazioni verranno eliminate.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Cancella tutto",
          style: "destructive",
          onPress: deleteAllTransactions,
        },
      ],
    );
  };

  const handleExportCSV = async () => {
    if (transactions.length === 0) {
      Alert.alert("Nessun dato", "Non ci sono transazioni da esportare.");
      return;
    }

    const header = "ID,Importo,Tipo,Categoria,Nota,Data\n";
    const rows = transactions
      .map(
        (tx) =>
          `${tx.id},${(tx.amount / 100).toFixed(2)},${tx.type},${tx.category},"${tx.note ?? ""}",${new Date(tx.createdAt).toISOString()}`,
      )
      .join("\n");

    const csv = header + rows;
    const file = new File(Paths.cache, "netto_export.csv");
    file.write(csv);
    await Sharing.shareAsync(file.uri, { mimeType: "text/csv" });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets
    >
      {/* Perdite per categoria */}
      <Text style={styles.sectionTitle}>Perdite per categoria</Text>
      <View style={styles.card}>
        {lossByCategory.total === 0 ? (
          <Text style={styles.emptyText}>Nessuna perdita registrata.</Text>
        ) : (
          Object.entries(lossByCategory.map).map(([cat, amount]) => {
            const pct = (amount / lossByCategory.total) * 100;
            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryLabel}>
                    {CATEGORY_LABELS[cat as TransactionCategory] ?? cat}
                  </Text>
                  <Text style={styles.categoryPct}>{pct.toFixed(0)}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${pct}%` }]}
                  />
                </View>
                <Text style={styles.categoryAmount}>
                  {(amount / 100).toFixed(2)} €
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Sicurezza */}
      <Text style={styles.sectionTitle}>Sicurezza</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Blocco Face ID</Text>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometric}
            trackColor={{ false: Colors.surface, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
      </View>

      {/* Dati */}
      <Text style={styles.sectionTitle}>Dati</Text>
      <View style={styles.card}>
        <Pressable style={styles.button} onPress={handleExportCSV}>
          <Text style={styles.buttonText}>Esporta CSV</Text>
        </Pressable>
      </View>

      {/* Tip Jar */}
      <Text style={styles.sectionTitle}>Supporta Netto</Text>
      <View style={styles.card}>
        <Text style={styles.tipMessage}>
          Netto è gratuita e senza pubblicità. Se ti è utile, offrici un caffè.
        </Text>
        <Pressable style={styles.tipButton} onPress={handleTipJar}>
          <Text style={styles.tipButtonText}>Dona un caffè ☕</Text>
        </Pressable>
      </View>

      {/* Safe Room */}
      <Text style={styles.sectionTitle}>Safe Room</Text>
      <View style={styles.safeCard}>
        <Text style={styles.safeMessage}>
          Se senti che il gioco sta diventando un problema, non sei solo.
          Parlare con qualcuno è il primo passo.
        </Text>

        <Pressable
          style={styles.safeLink}
          onPress={() => Linking.openURL("tel:800558822")}
        >
          <Text style={styles.safeLinkText}>
            Telefono Verde: 800 558822
          </Text>
          <Text style={styles.safeLinkSub}>
            Gratuito, attivo lun–ven 10–16
          </Text>
        </Pressable>

        <Pressable
          style={styles.safeLink}
          onPress={() =>
            Linking.openURL("https://lnx.giocatorianonimi.org/")
          }
        >
          <Text style={styles.safeLinkText}>Giocatori Anonimi Italia</Text>
          <Text style={styles.safeLinkSub}>lnx.giocatorianonimi.org</Text>
        </Pressable>
      </View>

      {/* Danger Zone */}
      <Text style={styles.dangerTitle}>Danger Zone</Text>
      <View style={styles.dangerCard}>
        <Pressable style={styles.dangerButton} onPress={handleDeleteAll}>
          <Text style={styles.dangerButtonText}>Cancella tutti i dati</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  categoryRow: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  categoryPct: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.loss,
  },
  categoryAmount: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    color: Colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  safeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  safeMessage: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  safeLink: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.background,
  },
  safeLinkText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  safeLinkSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  tipMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  tipButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  tipButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  dangerTitle: {
    color: Colors.loss,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 32,
    marginBottom: 8,
    marginLeft: 4,
  },
  dangerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.loss,
  },
  dangerButton: {
    backgroundColor: Colors.loss,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
