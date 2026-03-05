// Withdrawals.jsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;
const COMPANY_WALLET = "0x0688353c8f46299781e1a33ade320e25983d2402";

// Validators
const isValidEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const isValidWalletId = (id) => /^ARR-\d{5,}$/.test(id);

export function ExternalWithdrawal({ selectedAsset, onConfirm }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const amountNumber = Number(amount || 0);
  const withdrawalMillions = amountNumber / 1_000_000;
  const networkFee = withdrawalMillions * ETH_FEE_PER_MILLION_USDT;
  const insufficientMinimum = amountNumber > 0 && amountNumber < MIN_WITHDRAW_USDT;
  const addressValid = isValidEthAddress(walletAddress);

  if (!selectedAsset) return <p>Select an asset first</p>;

  const handleConfirm = async () => {
    await onConfirm({ type: "external", asset: selectedAsset.symbol, amount: amountNumber, walletAddress, networkFee });
    toast.success("External withdrawal submitted!");
    setStep(1);
    setAmount("");
    setWalletAddress("");
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={["Withdrawal Details", "Confirm Withdrawal"]} currentStep={step} color="blue" />

      {step === 1 && (
        <div className="space-y-5">
          <input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value.slice(0, 42))}
            placeholder="0x..."
            className="w-full p-3 border rounded-xl"
          />
          {!addressValid && walletAddress.length > 0 && <p className="text-red-500 text-xs">Invalid ETH address</p>}

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${selectedAsset.symbol})`}
            className="w-full p-3 border rounded-xl"
          />
          {insufficientMinimum && <p className="text-yellow-500 text-xs">Minimum withdrawal is 1,000,000 USDT</p>}

          <button
            disabled={!addressValid || amountNumber <= 0 || insufficientMinimum}
            onClick={() => setStep(2)}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="p-4 border rounded-xl">
            <p>Asset: {selectedAsset.symbol}</p>
            <p>Amount: {amount}</p>
            <p>Network Fee: {networkFee.toFixed(4)} ETH</p>
            <p>Wallet: {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</p>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">Back</button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InternalWithdrawal({ selectedAsset, onConfirm }) {
  const [step, setStep] = useState(1);
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const amountNumber = Number(amount || 0);
  const walletValid = isValidWalletId(walletId);

  if (!selectedAsset) return <p>Select an asset first</p>;

  const handleConfirm = async () => {
    await onConfirm({ type: "internal", asset: selectedAsset.symbol, amount: amountNumber, walletId });
    toast.success("Internal transfer submitted!");
    setStep(1);
    setWalletId("");
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={["Transfer Details", "Confirm Transfer"]} currentStep={step} color="emerald" />

      {step === 1 && (
        <div className="space-y-5">
          <input
            value={walletId}
            onChange={(e) => setWalletId(e.target.value.toUpperCase())}
            placeholder="ARR-12345"
            className="w-full p-3 border rounded-xl"
          />
          {!walletValid && walletId.length > 0 && <p className="text-red-500 text-xs">Invalid WalletID</p>}

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${selectedAsset.symbol})`}
            className="w-full p-3 border rounded-xl"
          />

          <button
            disabled={!walletValid || amountNumber <= 0}
            onClick={() => setStep(2)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="p-4 border rounded-xl">
            <p>Recipient: {walletId}</p>
            <p>Asset: {selectedAsset.symbol}</p>
            <p>Amount: {amount}</p>
            <p>Status: Instant Transfer</p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">Back</button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}