// WithdrawPage.jsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalWithdrawal, InternalWithdrawal } from "./Withdrawals";

export default function WithdrawPage() {
  const [withdrawalType, setWithdrawalType] = useState("external");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // MOCK USER ASSETS
  const assets = [
    { symbol: "USDT", balance: 5000000 },
    { symbol: "ETH", balance: 12.34 },
    { symbol: "BTC", balance: 0.25 },
  ];

  const handleExternalConfirm = (data) => {
    console.log("External Withdrawal:", data);
  };

  const handleInternalConfirm = (data) => {
    console.log("Internal Transfer:", data);
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-6">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <h2 className="text-2xl font-bold">Withdraw Assets</h2>

        {/* Asset Selector */}
        <div className="flex gap-4 flex-wrap">
          {assets.map((a) => (
            <button
              key={a.symbol}
              onClick={() => setSelectedAsset(a)}
              className={`px-4 py-2 rounded-xl border ${selectedAsset?.symbol === a.symbol ? "border-blue-500 bg-blue-500/10" : "border-border"}`}
            >
              {a.symbol} - {a.balance}
            </button>
          ))}
        </div>

        {/* Withdrawal Type */}
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`p-4 rounded-xl border ${withdrawalType === "external" ? "border-blue-500 bg-blue-500/10" : "border-border"}`}
            onClick={() => setWithdrawalType("external")}
          >
            External Withdraw
          </button>
          <button
            className={`p-4 rounded-xl border ${withdrawalType === "internal" ? "border-emerald-500 bg-emerald-500/10" : "border-border"}`}
            onClick={() => setWithdrawalType("internal")}
          >
            Internal Transfer
          </button>
        </div>

        {/* Withdrawal Component */}
        <div className="mt-4">
          {withdrawalType === "external" ? (
            <ExternalWithdrawal selectedAsset={selectedAsset} onConfirm={handleExternalConfirm} />
          ) : (
            <InternalWithdrawal selectedAsset={selectedAsset} onConfirm={handleInternalConfirm} />
          )}
        </div>
      </Card>
    </div>
  );
}