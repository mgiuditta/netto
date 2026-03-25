import { create } from "zustand";
import { desc, eq, and, gte, sql } from "drizzle-orm";
import { db, transactions, type Transaction, type TransactionType, type TransactionCategory } from "@/db";

interface ImportRow {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  note: string | null;
  createdAt: number;
}

interface TransactionState {
  transactions: Transaction[];
  netBalance: number;
  monthWins: number;
  monthLosses: number;
  isLoaded: boolean;

  addTransaction: (
    amount: number,
    type: TransactionType,
    category: TransactionCategory,
    note?: string,
  ) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;
  importTransactions: (rows: ImportRow[]) => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadStats: () => Promise<void>;
}

function getMonthStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  netBalance: 0,
  monthWins: 0,
  monthLosses: 0,
  isLoaded: false,

  addTransaction: async (amount, type, category, note) => {
    await db.insert(transactions).values({
      amount,
      type,
      category,
      note: note || null,
      createdAt: Date.now(),
    });
    await get().loadTransactions();
    await get().loadStats();
  },

  deleteTransaction: async (id) => {
    await db.delete(transactions).where(eq(transactions.id, id));
    await get().loadTransactions();
    await get().loadStats();
  },

  deleteAllTransactions: async () => {
    await db.delete(transactions);
    await get().loadTransactions();
    await get().loadStats();
  },

  importTransactions: async (rows) => {
    await db.delete(transactions);
    for (const row of rows) {
      await db.insert(transactions).values(row);
    }
    await get().loadTransactions();
    await get().loadStats();
  },

  loadTransactions: async () => {
    const rows = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
    set({ transactions: rows, isLoaded: true });
  },

  loadStats: async () => {
    const allRows = await db
      .select({
        type: transactions.type,
        total: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .groupBy(transactions.type);

    let totalWins = 0;
    let totalLosses = 0;
    for (const row of allRows) {
      if (row.type === "win") totalWins = row.total;
      if (row.type === "loss") totalLosses = row.total;
    }

    const monthStart = getMonthStart();
    const monthRows = await db
      .select({
        type: transactions.type,
        total: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(gte(transactions.createdAt, monthStart))
      .groupBy(transactions.type);

    let monthWins = 0;
    let monthLosses = 0;
    for (const row of monthRows) {
      if (row.type === "win") monthWins = row.total;
      if (row.type === "loss") monthLosses = row.total;
    }

    set({
      netBalance: totalWins - totalLosses,
      monthWins,
      monthLosses,
    });
  },
}));
