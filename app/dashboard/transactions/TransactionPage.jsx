// tRANSACTIONpAGE.JSX
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

/* -------------------------------------------------- */
/* TRANSACTION CARD */
/* -------------------------------------------------- */

function TransactionCard({ tx, type }) {
    const isReceived = type === "received";

    return (
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">

            {/* LEFT */}
            <div className="flex flex-col">
                <span className="text-sm font-medium text-white">

                    {isReceived ? "+" : "-"}
                    {tx.amount} {tx.coin}

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

                    {tx.transactionId && (
                        <span className="ml-2 font-mono text-[11px]">
                            {tx.transactionId.slice(0, 6)}...
                            {tx.transactionId.slice(-4)}
                        </span>
                    )}

                </span>

            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-end">

                <span
                    className={`text-xs px-2 py-1 rounded ${tx.status === "confirmed" || tx.status === "approved"
                            ? "bg-green-900 text-green-400"
                            : tx.status === "pending"
                                ? "bg-yellow-900 text-yellow-400"
                                : "bg-red-900 text-red-400"
                        }`}
                >
                    {tx.status}
                </span>

                <span className="text-[11px] text-zinc-500 mt-1">
                    {new Date(tx.createdAt).toLocaleString()}
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

export default function TransactionPage() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [receivedTransactions, setReceivedTransactions] = useState([]);
    const [sentTransactions, setSentTransactions] = useState([]);

    const [stocksTransactions, setStocksTransactions] = useState([]);

    /* -------------------------------------------------- */
    /* FETCH TRANSACTIONS */
    /* -------------------------------------------------- */

    const fetchTransactions = async () => {

        try {

            setLoading(true);
            setError(null);

            const res = await fetch("/api/transactions");

            if (!res.ok) throw new Error("Failed to fetch transactions");

            const txData = await res.json();

            const deposits = (txData.deposits ?? []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            const withdrawals = (txData.withdrawals ?? []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            const stocks = (txData.stocks ?? []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setReceivedTransactions(deposits);
            setSentTransactions(withdrawals);
            setStocksTransactions(stocks);

        } catch (err) {

            console.error(err);
            setError("Unable to load transactions");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        fetchTransactions();
    }, []);

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

        <div className="max-w-3xl mx-auto p-4">

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
                            <TransactionCard
                                key={tx._id || i}
                                tx={tx}
                                type="received"
                            />
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
                            <TransactionCard
                                key={tx._id || i}
                                tx={tx}
                                type="sent"
                            />
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
                            <TransactionCard
                                key={tx._id || i}
                                tx={tx}
                                type="stocks"
                            />
                        ))}

                </TabsContent>

            </Tabs>

        </div>

    );
}