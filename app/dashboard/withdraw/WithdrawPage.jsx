// WithdrawPage.jsx

"use client";

import { useEffect, useState } from "react";
import NavHeader from "../components/NavHeader/NavHeader";
import { Card } from "@/components/ui/card";
import { Send, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

/* -------------------------------------------------- */
/* CONSTANTS */
/* -------------------------------------------------- */

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;
const COMPANY_WALLET = "0x0688353c8f46299781e1a33ade320e25983d2402";

/* -------------------------------------------------- */
/* WITHDRAW TYPE SELECTOR */
/* -------------------------------------------------- */

function WithdrawalTypeSelector({ withdrawalType, setWithdrawalType }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setWithdrawalType("external")}
        className={`p-6 rounded-2xl border-2 transition ${
          withdrawalType === "external"
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
        className={`p-6 rounded-2xl border-2 transition ${
          withdrawalType === "internal"
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
/* EXTERNAL WITHDRAW */
/* -------------------------------------------------- */

function ExternalWithdrawal({ selectedAsset }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const amountNumber = Number(amount || 0);
  const withdrawalMillions = amountNumber / 1_000_000;
  const networkFeeEth =
    withdrawalMillions > 0
      ? withdrawalMillions * ETH_FEE_PER_MILLION_USDT
      : 0;
  const insufficientMinimum =
    amountNumber > 0 && amountNumber < MIN_WITHDRAW_USDT;

  if (!selectedAsset)
    return <p className="text-sm text-muted-foreground">Please select an asset first.</p>;

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex justify-between text-xs font-medium">
        <span className={step === 1 ? "text-blue-600" : "text-muted-foreground"}>1. Details</span>
        <span className={step === 2 ? "text-blue-600" : "text-muted-foreground"}>2. Summary</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Input
            placeholder="External Wallet Address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value.slice(0, 42))}
          />

          <Input
            type="number"
            placeholder={`Amount (${selectedAsset.symbol})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Estimated Network Fee: {networkFeeEth.toFixed(4)} ETH</p>
            {insufficientMinimum && (
              <p className="text-yellow-500">
                Minimum withdrawal is 1,000,000 USDT
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              disabled={!walletAddress || amountNumber <= 0 || insufficientMinimum}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border bg-muted/20 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Asset</span>
              <span>{selectedAsset.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee</span>
              <span>{networkFeeEth.toFixed(4)} ETH</span>
            </div>
          </div>

          <div className="p-4 border rounded-xl text-xs">
            Deposit network fee to:
            <div className="mt-2 font-mono break-all">{COMPANY_WALLET}</div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">Back</button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* INTERNAL TRANSFER */
/* -------------------------------------------------- */

function InternalWithdrawal({ selectedAsset }) {
  const [step, setStep] = useState(1);
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");

  const amountNumber = Number(amount || 0);

  if (!selectedAsset)
    return <p className="text-sm text-muted-foreground">Please select an asset first.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-xs font-medium">
        <span className={step === 1 ? "text-emerald-600" : "text-muted-foreground"}>1. Details</span>
        <span className={step === 2 ? "text-emerald-600" : "text-muted-foreground"}>2. Confirm</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Input
            placeholder="ArroxChain WalletID (e.g. ARR-32231)"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value.toUpperCase())}
          />

          <Input
            type="number"
            placeholder={`Amount (${selectedAsset.symbol})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="flex justify-end">
            <button
              disabled={!walletId || amountNumber <= 0}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border bg-emerald-500/10 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Recipient</span>
              <span>{walletId}</span>
            </div>
            <div className="flex justify-between">
              <span>Asset</span>
              <span>{selectedAsset.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-emerald-600">Instant</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">Back</button>
            <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl">Confirm Transfer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* MAIN PAGE */
/* -------------------------------------------------- */

export default function WithdrawPage() {
  const [withdrawalType, setWithdrawalType] = useState("external");
  const [userAssets, setUserAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // 🔥 Fetch real user assets
  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("/api/user-assets");
        const data = await res.json();
        setUserAssets(data.assets || []);

        if (data.assets?.length > 0) {
          setSelectedAsset(data.assets[0]);
        }
      } catch (err) {
        console.error("Failed to load assets:", err);
        setUserAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    }

    fetchAssets();
  }, []);

  return (
    <div className="relative min-h-screen w-full mb-10">
      <NavHeader className="text-foreground" />

      <div className="flex flex-1 items-center justify-center px-2 sm:px-0 mb-8">
        <Card className="w-full max-w-3xl p-6 space-y-6">
          <h2 className="text-2xl font-bold">Withdraw Assets</h2>

          {loadingAssets ? (
            <p className="text-sm text-muted-foreground">Loading assets...</p>
          ) : (
            <>
         
              <WithdrawalTypeSelector
                withdrawalType={withdrawalType}
                setWithdrawalType={setWithdrawalType}
              />

              <div className="border-t pt-6">
                {withdrawalType === "external" ? (
                  <ExternalWithdrawal selectedAsset={selectedAsset} />
                ) : (
                  <InternalWithdrawal selectedAsset={selectedAsset} />
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}