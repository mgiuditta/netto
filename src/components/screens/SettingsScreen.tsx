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
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useTransactionStore } from "@/stores/transaction-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useToast } from "@/components/Toast";
import type { TransactionCategory, TransactionType } from "@/db";

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  slot: "Slot",
  scommesse: "Scommesse",
  poker: "Poker",
  gratta_e_vinci: "Gratta e Vinci",
};

export default function SettingsScreen() {
  const transactions = useTransactionStore((s) => s.transactions);
  const deleteAllTransactions = useTransactionStore((s) => s.deleteAllTransactions);
  const importTransactions = useTransactionStore((s) => s.importTransactions);
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const toggleBiometric = useSettingsStore((s) => s.toggleBiometric);
  const toast = useToast();

  const statsByCategory = useMemo(() => {
    const wins: Record<string, number> = {};
    const losses: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "win") {
        wins[tx.category] = (wins[tx.category] || 0) + tx.amount;
      } else {
        losses[tx.category] = (losses[tx.category] || 0) + tx.amount;
      }
    }
    const categories = [...new Set([...Object.keys(wins), ...Object.keys(losses)])];
    return categories.map((cat) => {
      const win = wins[cat] || 0;
      const loss = losses[cat] || 0;
      const total = win + loss;
      return { cat, win, loss, total, winPct: total > 0 ? (win / total) * 100 : 0, lossPct: total > 0 ? (loss / total) * 100 : 0 };
    });
  }, [transactions]);

  const handleDeleteAll = () => {
    Alert.alert(
      "Cancella tutti i dati",
      "Questa azione è irreversibile. Tutte le transazioni verranno eliminate.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Cancella tutto",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteAllTransactions();
            toast.show("Tutti i dati cancellati");
          },
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
    toast.show("CSV esportato");
  };

  const VALID_TYPES = new Set(["win", "loss"]);
  const VALID_CATEGORIES = new Set(["slot", "scommesse", "poker", "gratta_e_vinci"]);

  const handleImportCSV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = new File(result.assets[0].uri);
    const content = await file.text();
    const lines = content.split("\n").filter((l: string) => l.trim().length > 0);

    if (lines.length < 2) {
      Alert.alert("File non valido", "Il file CSV non contiene transazioni.");
      return;
    }

    const rows: { amount: number; type: TransactionType; category: TransactionCategory; note: string | null; createdAt: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/^(\d+),([\d.]+),(win|loss),([\w]+),"(.*)",([\w\-:.TZ]+)$/);
      if (!match) continue;

      const [, , importoStr, type, category, note, dateStr] = match;
      if (!VALID_TYPES.has(type) || !VALID_CATEGORIES.has(category)) continue;

      const amountCents = Math.round(parseFloat(importoStr) * 100);
      const createdAt = new Date(dateStr).getTime();

      if (isNaN(amountCents) || amountCents <= 0 || isNaN(createdAt)) continue;

      rows.push({
        amount: amountCents,
        type: type as TransactionType,
        category: category as TransactionCategory,
        note: note || null,
        createdAt,
      });
    }

    if (rows.length === 0) {
      Alert.alert("File non valido", "Nessuna transazione valida trovata nel file.");
      return;
    }

    Alert.alert(
      "Importa backup",
      `Verranno importate ${rows.length} transazioni.\n\nAttenzione: tutti i dati attualmente presenti verranno eliminati e sostituiti con quelli del file.`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Importa",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await importTransactions(rows);
            toast.show(`${rows.length} transazioni importate`);
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets
    >
      {/* Per categoria */}
      <Text style={styles.sectionTitle}>Per categoria</Text>
      <View style={styles.card}>
        {statsByCategory.length === 0 ? (
          <Text style={styles.emptyText}>Nessuna transazione registrata.</Text>
        ) : (
          statsByCategory.map(({ cat, win, loss, winPct, lossPct }) => (
            <View key={cat} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>
                {CATEGORY_LABELS[cat as TransactionCategory] ?? cat}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFillWin, { width: `${winPct}%` }]} />
                <View style={[styles.barFillLoss, { width: `${lossPct}%` }]} />
              </View>
              <View style={styles.categoryAmounts}>
                <Text style={[styles.categoryAmount, { color: Colors.win }]}>
                  +{(win / 100).toFixed(2)} €
                </Text>
                <Text style={[styles.categoryAmount, { color: Colors.loss }]}>
                  −{(loss / 100).toFixed(2)} €
                </Text>
              </View>
            </View>
          ))
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
        <Pressable style={[styles.button, styles.buttonOutline]} onPress={handleImportCSV}>
          <Text style={[styles.buttonText, styles.buttonOutlineText]}>Importa CSV</Text>
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
    marginBottom: 16,
  },
  categoryLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 6,
  },
  barFillWin: {
    height: 8,
    backgroundColor: Colors.win,
  },
  barFillLoss: {
    height: 8,
    backgroundColor: Colors.loss,
  },
  categoryAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
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
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 10,
  },
  buttonOutlineText: {
    color: Colors.primary,
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
