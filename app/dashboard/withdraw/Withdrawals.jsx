// Withdrawals.jsx - Contains both ExternalWithdrawal and InternalWithdrawal components with shared logic and styling.
"use client";

import { useState } from "react";
import { Send, Zap } from "lucide-react";
import { toast } from "react-hot-toast"; // optional for notifications

/* -------------------------------------------------- */
/* CONSTANTS */
/* -------------------------------------------------- */

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;
const COMPANY_WALLET = "0x0688353c8f46299781e1a33ade320e25983d2402";

/* -------------------------------------------------- */
/* STEP INDICATOR (Reusable) */
/* -------------------------------------------------- */

function StepIndicator({ steps, currentStep, color }) {
  return (
    <div className="flex justify-between text-xs font-medium mb-4">
      {steps.map((label, i) => (
        <span
          key={i}
          className={currentStep === i + 1 ? `text-${color}-600` : "text-muted-foreground"}
        >
          {i + 1}. {label}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------- */
/* VALIDATION HELPERS */
/* -------------------------------------------------- */

function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidWalletId(walletId) {
  return /^ARR-\d{5,}$/.test(walletId);
}

/* -------------------------------------------------- */
/* EXTERNAL WITHDRAWAL COMPONENT */
/* -------------------------------------------------- */

function ExternalWithdrawal({ selectedAsset, onConfirm }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const amountNumber = Number(amount || 0);
  const withdrawalMillions = amountNumber / 1_000_000;
  const networkFeeEth = withdrawalMillions > 0 ? withdrawalMillions * ETH_FEE_PER_MILLION_USDT : 0;
  const insufficientMinimum = amountNumber > 0 && amountNumber < MIN_WITHDRAW_USDT;
  const addressValid = isValidEthAddress(walletAddress);

  if (!selectedAsset) return <p className="text-sm text-muted-foreground">Please select an asset first.</p>;

  const handleConfirm = async () => {
    try {
      // Replace this with your backend API call
      await onConfirm({
        type: "external",
        asset: selectedAsset.symbol,
        amount: amountNumber,
        walletAddress,
        networkFee: networkFeeEth,
      });
      toast.success("Withdrawal submitted!");
      setStep(1);
      setAmount("");
      setWalletAddress("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process withdrawal");
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={["Withdrawal Details", "Confirm Withdrawal"]} currentStep={step} color="blue" />

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground mb-2">External Wallet Address</p>
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.slice(0, 42))}
              placeholder="0x..."
              className="w-full p-3 rounded-xl border bg-background"
            />
            {!addressValid && walletAddress.length > 0 && (
              <p className="text-red-500 text-xs mt-1">Invalid Ethereum address</p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Withdrawal Amount ({selectedAsset.symbol})</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 rounded-xl border bg-background"
            />
            {insufficientMinimum && (
              <p className="text-yellow-500 text-xs mt-1">Minimum withdrawal is 1,000,000 USDT</p>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 border rounded-xl p-3 bg-muted/20">
            <p>Estimated Network Fee: {networkFeeEth.toFixed(4)} ETH</p>
          </div>

          <div className="flex justify-end">
            <button
              disabled={!addressValid || amountNumber <= 0 || insufficientMinimum}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

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
              <span className="text-xs">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          </div>

          <div className="border rounded-xl p-3 text-xs bg-yellow-500/10">
            Network fee must be deposited to:
            <div className="mt-2 font-mono break-all">{COMPANY_WALLET}</div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">
              Back
            </button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* INTERNAL WITHDRAWAL COMPONENT */
/* -------------------------------------------------- */

function InternalWithdrawal({ selectedAsset, onConfirm }) {
  const [step, setStep] = useState(1);
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const amountNumber = Number(amount || 0);
  const walletValid = isValidWalletId(walletId);

  if (!selectedAsset) return <p className="text-sm text-muted-foreground">Please select an asset first.</p>;

  const handleConfirm = async () => {
    try {
      await onConfirm({
        type: "internal",
        asset: selectedAsset.symbol,
        amount: amountNumber,
        walletId,
      });
      toast.success("Internal transfer submitted!");
      setStep(1);
      setWalletId("");
      setAmount("");
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
              onChange={(e) => setWalletId(e.target.value.toUpperCase())}
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
              <span className="text-emerald-600 font-medium">Instant Transfer</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">
              Back
            </button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">
              Confirm Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ExternalWithdrawal, InternalWithdrawal };