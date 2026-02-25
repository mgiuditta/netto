import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-gifted-charts";
import { Colors } from "@/constants/colors";
import { useTransactionStore } from "@/stores/transaction-store";
import type { Transaction } from "@/db";

const CATEGORY_LABELS: Record<string, string> = {
  slot: "Slot",
  scommesse: "Scommesse",
  poker: "Poker",
  gratta_e_vinci: "Gratta e Vinci",
};

function formatAmount(cents: number): string {
  const abs = Math.abs(cents);
  return (abs / 100).toFixed(2).replace(".", ",");
}

const CHART_WIDTH = Dimensions.get("window").width - 72;

function buildChartData(transactions: Transaction[]) {
  if (transactions.length === 0) return [];

  const sorted = [...transactions].sort((a, b) => a.createdAt - b.createdAt);
  let cumulative = 0;

  return sorted.map((tx) => {
    cumulative += tx.type === "win" ? tx.amount : -tx.amount;
    return { value: cumulative / 100 };
  });
}

const MAX_RECENT = 5;

export default function HomeScreen() {
  const router = useRouter();
  const netBalance = useTransactionStore((s) => s.netBalance);
  const monthWins = useTransactionStore((s) => s.monthWins);
  const monthLosses = useTransactionStore((s) => s.monthLosses);
  const transactions = useTransactionStore((s) => s.transactions);
  const recentTransactions = transactions.slice(0, MAX_RECENT);

  const chartData = useMemo(() => buildChartData(transactions), [transactions]);

  const chartMax = useMemo(() => {
    if (chartData.length === 0) return 100;
    const absMax = Math.max(...chartData.map((d) => Math.abs(d.value)));
    return Math.max(absMax * 1.2, 10);
  }, [chartData]);

  const balanceColor = netBalance >= 0 ? Colors.win : Colors.loss;
  const balanceSign = netBalance >= 0 ? "+" : "−";
  const lineColor = chartData.length > 0 && chartData[chartData.length - 1].value >= 0
    ? Colors.win
    : Colors.loss;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Saldo Netto */}
      <Text style={styles.label}>Saldo Netto</Text>
      <Text style={[styles.balance, { color: balanceColor }]}>
        {balanceSign}€{formatAmount(netBalance)}
      </Text>

      {/* Grafico andamento cumulativo */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Andamento</Text>
        {chartData.length < 2 ? (
          <View style={styles.chartEmpty}>
            <Text style={styles.chartEmptyText}>
              Aggiungi almeno 2 transazioni per vedere il trend
            </Text>
          </View>
        ) : (
          <LineChart
            data={chartData}
            width={CHART_WIDTH}
            height={100}
            maxValue={chartMax}
            mostNegativeValue={-chartMax}
            spacing={CHART_WIDTH / (chartData.length - 1)}
            color={lineColor}
            thickness={2.5}
            hideDataPoints
            curved
            areaChart
            startFillColor={lineColor}
            endFillColor={Colors.surface}
            startOpacity={0.3}
            endOpacity={0}
            hideRules
            hideYAxisText
            hideAxesAndRules
            yAxisLabelWidth={0}
            disableScroll
            initialSpacing={0}
            endSpacing={0}
            overflowBottom={0}
            overflowTop={0}
            showReferenceLine1
            referenceLine1Position={0}
            referenceLine1Config={{
              color: Colors.textSecondary,
              dashWidth: 4,
              dashGap: 4,
              thickness: 0.5,
            }}
          />
        )}
      </View>

      {/* Card mese corrente */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Questo mese</Text>
        <View style={styles.cardRow}>
          <View style={styles.cardCol}>
            <Text style={styles.cardLabel}>Vinto</Text>
            <Text style={[styles.cardValue, { color: Colors.win }]}>
              +€{formatAmount(monthWins)}
            </Text>
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.cardLabel}>Perso</Text>
            <Text style={[styles.cardValue, { color: Colors.loss }]}>
              −€{formatAmount(monthLosses)}
            </Text>
          </View>
        </View>
      </View>

      {/* Ultime transazioni */}
      {recentTransactions.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Ultime transazioni</Text>
          {recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.recentRow}>
              <Text style={styles.recentCategory}>{CATEGORY_LABELS[tx.category]}</Text>
              <Text
                style={[
                  styles.recentAmount,
                  { color: tx.type === "win" ? Colors.win : Colors.loss },
                ]}
              >
                {tx.type === "win" ? "+" : "−"}€{formatAmount(tx.amount)}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push("/(tabs)/history")}
          >
            <Text style={styles.ctaText}>Vedi tutto lo storico</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 4,
  },
  balance: {
    fontSize: 52,
    fontWeight: "800",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  chartEmpty: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  chartEmptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cardCol: {
    alignItems: "center",
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  recentSection: {
    marginTop: 16,
  },
  recentTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 2,
  },
  recentCategory: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  ctaBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ctaText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
