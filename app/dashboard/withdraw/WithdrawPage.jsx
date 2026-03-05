// WithdrawPage.jsx 
"use client";

import { useEffect, useState } from "react";
import NavHeader from "../components/NavHeader/NavHeader";
import { Card } from "@/components/ui/card";
import { Send, Zap } from "lucide-react";
import { toast } from "sonner";
import getUserAssets from "@/controllers/getUserAssets"; // your existing function
import { ExternalWithdrawal, InternalWithdrawal } from "./Withdrawals";


/* -------------------------------------------------- */
/* WITHDRAW TYPE SELECTOR */
/* -------------------------------------------------- */

function WithdrawalTypeSelector({ withdrawalType, setWithdrawalType }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setWithdrawalType("external")}
        className={`p-6 rounded-2xl border-2 transition ${withdrawalType === "external"
            ? "border-blue-500 bg-blue-500/10"
            : "border-border hover:border-blue-500/50"
          }`}
      >
        <div className="flex flex-col items-center gap-3">
          <Send className="w-8 h-8 text-blue-600" />
          <h3 className="font-semibold">External Withdraw</h3>
          <p className="text-xs text-muted-foreground text-center">
            Withdraw to external wallet
          </p>
        </div>
      </button>

      <button
        onClick={() => setWithdrawalType("internal")}
        className={`p-6 rounded-2xl border-2 transition ${withdrawalType === "internal"
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-border hover:border-emerald-500/50"
          }`}
      >
        <div className="flex flex-col items-center gap-3">
          <Zap className="w-8 h-8 text-emerald-600" />
          <h3 className="font-semibold">Internal Transfer</h3>
          <p className="text-xs text-muted-foreground text-center">
            Transfer using ArroxChain WalletID
          </p>
        </div>
      </button>
    </div>
  );
}

/* -------------------------------------------------- */
/* ASSET SELECTOR COMPONENT */
/* -------------------------------------------------- */

function AssetSelector({ assets, selectedAsset, setSelectedAsset }) {
  return (
    <div className="flex flex-wrap gap-4">
      {assets.map((asset) => (
        <button
          key={asset.symbol}
          onClick={() => setSelectedAsset(asset)}
          className={`px-4 py-2 rounded-xl border transition ${selectedAsset?.symbol === asset.symbol
              ? "border-blue-500 bg-blue-500/10"
              : "border-border hover:border-blue-500/50"
            }`}
        >
          {asset.symbol} - {asset.balance}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------- */
/* MAIN PAGE */
/* -------------------------------------------------- */

export default function WithdrawPage() {
  const [withdrawalType, setWithdrawalType] = useState("external");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const data = await getUserAssets();
        setAssets(data || []);
      } catch (err) {
        console.error("Failed to load assets:", err);
        toast.error("Failed to load assets");
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  /* -----------------------------
     Confirm Handlers for Withdrawals
  ----------------------------- */
  const handleExternalConfirm = async ({ asset, amount, walletAddress, networkFee }) => {
    // Replace this with your backend API call
    console.log("External withdrawal:", { asset, amount, walletAddress, networkFee });
    toast.success(`External withdrawal of ${amount} ${asset} submitted!`);
  };

  const handleInternalConfirm = async ({ asset, amount, walletId }) => {
    // Replace this with your backend API call
    console.log("Internal transfer:", { asset, amount, walletId });
    toast.success(`Internal transfer of ${amount} ${asset} submitted!`);
  };

  return (
    <div className="relative min-h-screen w-full mb-10">
      <NavHeader className="text-foreground" />

      <div className="flex flex-1 items-center justify-center px-2 sm:px-0 mb-8">
        <Card className="w-full max-w-3xl p-6 space-y-6">
          <h2 className="text-2xl font-bold">Withdraw Assets</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading assets...</p>
          ) : (
            <>
              <AssetSelector
                assets={assets}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
              />

              <WithdrawalTypeSelector
                withdrawalType={withdrawalType}
                setWithdrawalType={setWithdrawalType}
              />

              <div className="border-t pt-6">
                {withdrawalType === "external" ? (
                  <ExternalWithdrawal
                    selectedAsset={selectedAsset}
                    onConfirm={handleExternalConfirm}
                  />
                ) : (
                  <InternalWithdrawal
                    selectedAsset={selectedAsset}
                    onConfirm={handleInternalConfirm}
                  />
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}