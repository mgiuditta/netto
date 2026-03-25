import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { Colors } from "@/constants/colors";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/constants/categories";
import { formatCents } from "@/utils/format";
import { useTransactionStore } from "@/stores/transaction-store";
import type { Transaction, TransactionCategory } from "@/db";

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

const MONTHS_TO_SHOW = 6;
const MONTH_NAMES = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];


function buildMonthlyBars(transactions: Transaction[]) {
  const now = new Date();
  const months: { key: string; label: string; wins: number; losses: number }[] = [];

  for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months.push({ key, label: MONTH_NAMES[d.getMonth()], wins: 0, losses: 0 });
  }

  for (const tx of transactions) {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const month = months.find((m) => m.key === key);
    if (!month) continue;
    if (tx.type === "win") month.wins += tx.amount;
    else month.losses += tx.amount;
  }

  const bars: { value: number; frontColor: string; label?: string; spacing?: number }[] = [];
  for (const m of months) {
    bars.push({ value: m.wins / 100, frontColor: Colors.win, label: m.label, spacing: 2 });
    bars.push({ value: m.losses / 100, frontColor: Colors.loss, spacing: 16 });
  }
  return bars;
}

function buildCategoryPie(transactions: Transaction[]) {
  const totals = new Map<TransactionCategory, number>();
  for (const tx of transactions) {
    if (tx.type === "loss") {
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }
  }

  if (totals.size === 0) return [];

  return [...totals.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, cents]) => ({
      value: cents / 100,
      color: CATEGORY_COLORS[cat],
      text: CATEGORY_LABELS[cat],
    }));
}

const MAX_RECENT = 5;

export default function HomeScreen() {
  const router = useRouter();
  const isLoaded = useTransactionStore((s) => s.isLoaded);
  const netBalance = useTransactionStore((s) => s.netBalance);
  const monthWins = useTransactionStore((s) => s.monthWins);
  const monthLosses = useTransactionStore((s) => s.monthLosses);
  const transactions = useTransactionStore((s) => s.transactions);
  const recentTransactions = transactions.slice(0, MAX_RECENT);

  const chartData = useMemo(() => buildChartData(transactions), [transactions]);
  const barData = useMemo(() => buildMonthlyBars(transactions), [transactions]);
  const pieData = useMemo(() => buildCategoryPie(transactions), [transactions]);

  const chartMax = useMemo(() => {
    if (chartData.length === 0) return 100;
    const absMax = Math.max(...chartData.map((d) => Math.abs(d.value)));
    return Math.max(absMax * 1.2, 10);
  }, [chartData]);

  const barMax = useMemo(() => {
    if (barData.length === 0) return 100;
    const max = Math.max(...barData.map((d) => d.value));
    return Math.max(max * 1.2, 10);
  }, [barData]);

  const balanceColor = netBalance >= 0 ? Colors.win : Colors.loss;
  const balanceSign = netBalance >= 0 ? "+" : "−";
  const lineColor = chartData.length > 0 && chartData[chartData.length - 1].value >= 0
    ? Colors.win
    : Colors.loss;

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Saldo Netto */}
      <Text style={styles.label}>Saldo Netto</Text>
      <Text style={[styles.balance, { color: balanceColor }]}>
        {balanceSign}€{formatCents(netBalance)}
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
              +€{formatCents(monthWins)}
            </Text>
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.cardLabel}>Perso</Text>
            <Text style={[styles.cardValue, { color: Colors.loss }]}>
              −€{formatCents(monthLosses)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bar chart: Vinto vs Perso ultimi 6 mesi */}
      {barData.some((d) => d.value > 0) && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Ultimi 6 mesi</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.win }]} />
              <Text style={styles.legendText}>Vinto</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.loss }]} />
              <Text style={styles.legendText}>Perso</Text>
            </View>
          </View>
          <BarChart
            data={barData}
            width={CHART_WIDTH}
            height={120}
            maxValue={barMax}
            barWidth={12}
            barBorderRadius={3}
            noOfSections={3}
            hideRules
            hideYAxisText
            hideAxesAndRules
            yAxisLabelWidth={0}
            xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 11 }}
            disableScroll
            initialSpacing={8}
            endSpacing={8}
          />
        </View>
      )}

      {/* Pie chart: Breakdown spese per categoria */}
      {pieData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spese per categoria</Text>
          <View style={styles.pieContainer}>
            <PieChart
              data={pieData}
              radius={70}
              innerRadius={45}
              donut
              backgroundColor={Colors.surface}
              innerCircleColor={Colors.surface}
              centerLabelComponent={() => (
                <View style={styles.pieCenter}>
                  <Text style={styles.pieCenterText}>
                    €{(pieData.reduce((s, d) => s + d.value, 0)).toFixed(0)}
                  </Text>
                  <Text style={styles.pieCenterLabel}>Totale</Text>
                </View>
              )}
            />
            <View style={styles.pieLegend}>
              {pieData.map((d) => (
                <View key={d.text} style={styles.pieLegendRow}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.pieLegendText}>{d.text}</Text>
                  <Text style={styles.pieLegendValue}>€{d.value.toFixed(2).replace(".", ",")}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

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
                {tx.type === "win" ? "+" : "−"}€{formatCents(tx.amount)}
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
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
    marginBottom: 16,
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
  legendRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  pieContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 8,
  },
  pieCenter: {
    alignItems: "center",
  },
  pieCenterText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  pieCenterLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  pieLegend: {
    flex: 1,
    gap: 8,
  },
  pieLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pieLegendText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  pieLegendValue: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  recentSection: {
    marginTop: 0,
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
