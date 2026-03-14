// TransactionPage.JSX
"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { getWithdrawals } from "@/controllers/returnWithdraws";
import { getDeposits } from "@/controllers/returnDeposit";
import { getStocks } from "@/controllers/returnStock";
import NavHeader from "../components/NavHeader/NavHeader";

/* -------------------------------------------------- */
/* TRANSACTION CARD */
/* -------------------------------------------------- */

function TransactionCard({ tx, type }) {
  const isReceived = type === "received";
  const isStocks = type === "stocks";  // New flag for stocks

  const statusColor =
    tx.status === "completed"
      ? "bg-green-900 text-green-400"
      : tx.status === "pending"
        ? "bg-yellow-900 text-yellow-400"
        : "bg-red-900 text-red-400";

  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
      {/* LEFT */}
      <div className="flex flex-col">
        {isStocks ? (
          // Custom display for stocks
          <>
            <span className="text-sm font-medium text-white">
              {tx.symbol} - {tx.shares} shares
            </span>
            <span className="text-[12px] text-zinc-500">
              Price: ${tx.price}
            </span>
          </>
        ) : (
          // Existing display for deposits/withdrawals
          <>
            <span className="text-sm font-medium text-white">
              {isReceived ? "+" : "-"}
              {tx.amount} {tx.asset}
              {tx.network && (
                <span className="text-[10px] text-zinc-500 ml-2">
                  {tx.network}
                </span>
              )}
            </span>
            <span className="text-[12px] text-zinc-500">
              {isReceived
                ? "Deposit"
                : tx.type === "internal"
                  ? "Internal Transfer"
                  : "Withdrawal"}
            </span>
          </>
        )}
      </div>

      {/* RIGHT - Status and date remain the same */}
      <div className="flex flex-col items-end">
        <span className={`text-xs px-2 py-1 rounded ${statusColor}`}>
          {tx.status}
        </span>
        <span className="text-[11px] text-zinc-500 mt-1">
          {tx.createdAt
            ? new Date(tx.createdAt).toLocaleString()
            : "-"}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* LOADING SKELETON */
/* -------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
      ))}
    </div>
  );
}

/* -------------------------------------------------- */
/* TRANSACTION PAGE */
/* -------------------------------------------------- */

export default function TransactionPage({ userId }) {

console.log("userid:", userId);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [sentTransactions, setSentTransactions] = useState([]);
  const [stocksTransactions, setStocksTransactions] = useState([]);

  /* -------------------------------------------------- */
  /* FETCH TRANSACTIONS */
  /* -------------------------------------------------- */

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Run the three API calls in parallel
      const [withdrawalsRes, depositsRes, stocksRes] = await Promise.all([
        getWithdrawals(userId),
        getDeposits(userId),
        getStocks(userId)
      ]);

      // Process withdrawals
      if (!withdrawalsRes?.success) {
        throw new Error(withdrawalsRes?.message || "Failed to fetch withdrawals");
      }
      const internal = withdrawalsRes.withdrawals?.internal ?? [];
      const external = withdrawalsRes.withdrawals?.external ?? [];
      const withdrawals = [...internal, ...external].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSentTransactions(withdrawals);

      // Process deposits
      if (depositsRes.success) {
        const di = depositsRes.deposits?.internal ?? [];
        const de = depositsRes.deposits?.external ?? [];
        const deposits = [...di, ...de].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReceivedTransactions(deposits);
      } else {
        setReceivedTransactions([]);
      }

      // Process stocks
      if (stocksRes.success) {
        const stocks = stocksRes.stocks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setStocksTransactions(stocks);
      } else {
        setStocksTransactions([]);
      }

    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError("Unable to load transactions");
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /* -------------------------------------------------- */
  /* EMPTY STATE */
  /* -------------------------------------------------- */

  const EmptyState = ({ label }) => (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm">
      No {label} transactions yet
    </div>
  );

  /* -------------------------------------------------- */
  /* ERROR STATE */
  /* -------------------------------------------------- */

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-red-400">
      <AlertTriangle className="w-6 h-6 mb-2" />
      {error}

      <button
        onClick={fetchTransactions}
        className="mt-3 text-xs px-3 py-1 bg-zinc-800 rounded"
      >
        Retry
      </button>
    </div>
  );

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 relative z-10">

      <NavHeader />

      <h1 className="text-xl font-semibold text-white mb-4">
        Transaction History
      </h1>

      <Tabs defaultValue="received">

        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
        </TabsList>

        {/* RECEIVED */}

        <TabsContent value="received">

          {loading && <LoadingSkeleton />}

          {!loading && error && <ErrorState />}

          {!loading && !error && receivedTransactions.length === 0 && (
            <EmptyState label="deposit" />
          )}

          {!loading &&
            receivedTransactions.map((tx, i) => (
              <TransactionCard key={tx._id || i} tx={tx} type="received" />
            ))}

        </TabsContent>

        {/* SENT */}

        <TabsContent value="sent">

          {loading && <LoadingSkeleton />}

          {!loading && error && <ErrorState />}

          {!loading && !error && sentTransactions.length === 0 && (
            <EmptyState label="withdrawal" />
          )}

          {!loading &&
            sentTransactions.map((tx, i) => (
              <TransactionCard key={tx._id || i} tx={tx} type="sent" />
            ))}

        </TabsContent>

        {/* STOCKS */}

        <TabsContent value="stocks">

          {loading && <LoadingSkeleton />}

          {!loading && error && <ErrorState />}

          {!loading && !error && stocksTransactions.length === 0 && (
            <EmptyState label="stock" />
          )}

          {!loading &&
            stocksTransactions.map((tx, i) => (
              <TransactionCard key={tx._id || i} tx={tx} type="stocks" />
            ))}

        </TabsContent>

      </Tabs>

    </div>
  );
}