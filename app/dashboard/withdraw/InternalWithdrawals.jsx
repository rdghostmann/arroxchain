// InternalWithdrawal.jsx
"use client";

import { useWithdrawal } from "./useWithdrawal";
import { StepIndicator } from "./StepIndicator";
import { toast } from "sonner";

function isValidWalletId(walletId) {
  return /^ARR-\d{5,}$/.test(walletId);
}

export function InternalWithdrawal({ selectedAsset, onConfirm }) {
  const {
    step, setStep,
    amount, setAmount,
    walletField: walletId, setWalletField,
    amountNumber, reset
  } = useWithdrawal();

  if (!selectedAsset) return <p className="text-sm text-muted-foreground">Please select an asset first.</p>;

  const walletValid = isValidWalletId(walletId);

  const handleConfirm = async () => {
    try {
      await onConfirm({
        type: "internal",
        asset: selectedAsset.symbol,
        amount: amountNumber,
        walletId,
      });
      toast.success("Internal transfer submitted!");
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process transfer");
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={["Transfer Details", "Confirm Transfer"]} currentStep={step} color="emerald" />

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground mb-2">ArroxChain WalletID</p>
            <input
              value={walletId}
              onChange={(e) => setWalletField(e.target.value.toUpperCase())}
              placeholder="ARR-12345"
              className="w-full p-3 rounded-xl border bg-background"
            />
            {!walletValid && walletId.length > 0 && (
              <p className="text-red-500 text-xs mt-1">Invalid WalletID format</p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Transfer Amount ({selectedAsset.symbol})</p>
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
              disabled={!walletValid || amountNumber <= 0}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border bg-emerald-500/10 text-sm space-y-3">
            <div className="flex justify-between"><span>Recipient</span><span>{walletId}</span></div>
            <div className="flex justify-between"><span>Asset</span><span>{selectedAsset.symbol}</span></div>
            <div className="flex justify-between"><span>Amount</span><span>{amount}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="text-emerald-600 font-medium">Instant Transfer</span></div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">Back</button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">Confirm Transfer</button>
          </div>
        </div>
      )}
    </div>
  );
}
