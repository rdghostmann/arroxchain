// Transactionpage.jsx

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, LineChart } from "lucide-react";
import NavHeader from "../components/NavHeader/NavHeader";
import TransactionSkeleton from "@/components/TransactionSkeleton";

/* ----------------------------------
   Transaction Card
   Extracted as a proper component so
   it is stable across renders and
   React can reconcile keys correctly.
---------------------------------- */
function TransactionCard({ tx, type }) {
  let statusColor = "text-yellow-400";
  if (tx.status === "approved" || tx.status === "confirmed") statusColor = "text-green-500";
  if (tx.status === "failed" || tx.status === "rejected") statusColor = "text-red-500";

  const bgColor =
    type === "received" ? "bg-green-900/60" :
      type === "sent" ? "bg-red-900/60" :
        "bg-blue-900/60";

  const icon =
    type === "received" ? <ArrowDownLeft className="w-6 h-6 text-green-400" /> :
      type === "sent" ? <ArrowUpRight className="w-6 h-6 text-red-400" /> :
        <LineChart className="w-6 h-6 text-blue-400" />;

  const formattedDate =
    tx.createdAt && !isNaN(new Date(tx.createdAt))
      ? new Date(tx.createdAt).toLocaleString()
      : "Date unavailable";

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-xl border border-white/10 ${bgColor} shadow-lg transition-all duration-300 hover:scale-[1.01] flex flex-col gap-2 overflow-hidden`}
    >
      {/* Decorative glow — kept inside overflow-hidden so it doesn't bleed */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/30 shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Amount + date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="text-base sm:text-lg font-bold text-white truncate">
              {type === "received" && "+"}
              {type === "sent" && "−"}
              {type === "stocks"
                ? `${tx.shares} ${tx.symbol ?? ""}`
                : `${tx.amount?.toLocaleString?.() ?? "—"} ${tx.coin ?? ""}`}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">{formattedDate}</div>
          </div>

          {/* Details */}
          <div className="mt-2 text-xs sm:text-sm text-gray-300 space-y-1">
            {type === "stocks" ? (
              <>
                <div><span className="font-semibold text-white">Shares:</span> {tx.shares}</div>
                <div><span className="font-semibold text-white">Price:</span> ${tx.price}</div>
                <div>
                  <span className="font-semibold text-white">Status:</span>{" "}
                  <span className={`font-semibold ${statusColor}`}>{tx.status}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-semibold text-white">Type:</span>{" "}
                  {type === "received" ? "Deposit" : "Withdrawal"}
                </div>
                <div>
                  <span className="font-semibold text-white">Status:</span>{" "}
                  <span className={`font-semibold ${statusColor}`}>{tx.status}</span>
                </div>
                {tx.transactionId && (
                  <div className="truncate">
                    <span className="font-semibold text-white">Tx ID:</span> {tx.transactionId}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------
   Skeleton list helper
---------------------------------- */
function SkeletonList({ count = 5 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <TransactionSkeleton key={i} />
      ))}
    </div>
  );
}

/* ----------------------------------
   Empty state helper
---------------------------------- */
function EmptyState({ message }) {
  return (
    <div className="text-center text-gray-400 py-8 text-base">{message}</div>
  );
}

/* ----------------------------------
   Main Page
---------------------------------- */
const TransactionPage = () => {
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [sentTransactions, setSentTransactions] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  // Separate error state so we can surface fetch failures to the user
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [txRes, stockRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/user-stocks?all=true"),
      ]);

      // Guard against non-OK HTTP responses before parsing JSON
      if (!txRes.ok) throw new Error(`Transactions API error: ${txRes.status}`);
      if (!stockRes.ok) throw new Error(`Stocks API error: ${stockRes.status}`);

      const [txData, stockData] = await Promise.all([
        txRes.json(),
        stockRes.json(),
      ]);

      if (txData.success) {
        setReceivedTransactions(txData.deposits ?? []);
        setSentTransactions(txData.withdrawals ?? []);
      }

      if (stockData.success && Array.isArray(stockData.stocks)) {
        setStockTransactions(stockData.stocks);
      }

      // Fire-and-forget — don't let a failed mark-read crash the page
      fetch("/api/transactions/mark-read", { method: "POST" }).catch(() => { });

    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">

      {/* Background glow — kept outside main content flow */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-20 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 relative z-10">
        <NavHeader />

        <div className="border-none bg-black/30 shadow-xl backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="bg-linear-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent text-xl sm:text-2xl font-extrabold drop-shadow-lg">
              Transaction History
            </h2>
          </div>

          {/* Top-level error banner */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchData}
                className="ml-4 underline text-red-200 hover:text-white text-xs"
              >
                Retry
              </button>
            </div>
          )}

          <Tabs defaultValue="received" className="w-full">
            <TabsList className="mb-4 flex flex-nowrap justify-center gap-2 bg-gray-900/80 rounded-md shadow-lg border border-gray-700 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <TabsTrigger
                value="received"
                className="flex items-center gap-2 p-2 rounded-md font-medium text-gray-200 data-[state=active]:text-white data-[state=active]:bg-linear-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 transition shrink-0"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Received</span>
              </TabsTrigger>

              <TabsTrigger
                value="sent"
                className="flex items-center gap-2 p-2 rounded-md font-medium text-gray-200 data-[state=active]:text-white data-[state=active]:bg-linear-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 transition shrink-0"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Sent</span>
              </TabsTrigger>

              <TabsTrigger
                value="stocks"
                className="flex items-center gap-2 p-2 rounded-md font-medium text-gray-200 data-[state=active]:text-white data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 transition shrink-0"
              >
                <LineChart className="w-4 h-4" />
                <span>Stocks</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              {loading ? <SkeletonList /> :
                receivedTransactions.length === 0 ? <EmptyState message="No received transactions found." /> :
                  <div className="flex flex-col gap-3">
                    {receivedTransactions.map(tx => (
                      <TransactionCard key={tx._id} tx={tx} type="received" />
                    ))}
                  </div>}
            </TabsContent>

            <TabsContent value="sent">
              {loading ? <SkeletonList /> :
                sentTransactions.length === 0 ? <EmptyState message="No sent transactions found." /> :
                  <div className="flex flex-col gap-3">
                    {sentTransactions.map(tx => (
                      <TransactionCard key={tx._id} tx={tx} type="sent" />
                    ))}
                  </div>}
            </TabsContent>

            <TabsContent value="stocks">
              {loading ? <SkeletonList /> :
                stockTransactions.length === 0 ? <EmptyState message="No stock transactions found." /> :
                  <div className="flex flex-col gap-3">
                    {stockTransactions.map(tx => (
                      <TransactionCard key={tx._id} tx={tx} type="stocks" />
                    ))}
                  </div>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;