"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, Wallet2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BalanceDisplay({ formattedBalance, assets = [], change24h = 0 }) {
  const [show, setShow] = useState(true);

  // Calculate total coins and top asset
  const totalCoins = assets.length;
  const topAsset = assets[0]?.coin || "USDT";
  const topAssetAmount = assets[0]?.amount || 0;

  // Format 24h change
  const changeColor = change24h > 0 ? "text-green-400" : change24h < 0 ? "text-red-400" : "text-gray-400";
  const changeIcon = change24h > 0 ? <ArrowUpRight size={18} /> : change24h < 0 ? <ArrowDownRight size={18} /> : null;

  return (
    <div className="my-4 w-full">
      <div className="flex items-center gap-2 justify-between sm:justify-start mb-2">
        <div className="flex items-center gap-2">
          <Wallet2 className="text-yellow-500" size={22} />
          <p className="text-sm text-muted-foreground font-semibold">Total Balance</p>
        </div>
        <Button
          type="button"
          className="ml-2 text-white hover:text-white transition"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide balance" : "Show balance"}
        >
          {show ? <Eye size={20} /> : <EyeOff size={20} />}
        </Button>
      </div>
      <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-wide mb-1 transition">
        {show ? `$${formattedBalance}` : "••••••••"}
      </h3>
      {/* <div className="bg-card border border-border rounded-2xl shadow-lg px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-xl">
        <div className="flex flex-col items-center sm:items-start flex-1">
          
        </div>
      </div> */}
      {/* <div className="bg-card border border-border rounded-2xl shadow-lg px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-xl">
        <div className="flex flex-col items-center sm:items-start flex-1">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-wide mb-1 transition">
            {show ? `$${formattedBalance}` : "••••••••"}
          </h3>
        </div>
      </div> */}

    </div>
  );
}