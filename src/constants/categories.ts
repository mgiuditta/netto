import type { TransactionCategory } from "@/db";

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  slot: "Slot",
  scommesse: "Scommesse",
  poker: "Poker",
  gratta_e_vinci: "Gratta e Vinci",
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  slot: "#008F9C",
  scommesse: "#B04A4A",
  poker: "#C78D3C",
  gratta_e_vinci: "#6A5ACD",
};
