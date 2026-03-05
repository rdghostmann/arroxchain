// Withdrawals.jsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;

// Validators
const isValidEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const isValidWalletId = (id) => /^ARR-\d{5,}$/.test(id);

export function ExternalWithdrawal({ selectedAsset, selectedNetwork, onConfirm }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  if (!selectedAsset || !selectedNetwork) return <p>Select a token and network first</p>;

  const amountNumber = Number(amount || 0);
  const withdrawalMillions = amountNumber / 1_000_000;
  const networkFee = withdrawalMillions * ETH_FEE_PER_MILLION_USDT;
  const insufficientMinimum = amountNumber > 0 && amountNumber < MIN_WITHDRAW_USDT;
  const addressValid = isValidEthAddress(walletAddress);

  const handleConfirm = async () => {
    await onConfirm({ type: "external", asset: selectedAsset.symbol, network: selectedNetwork.name, amount: amountNumber, walletAddress, networkFee });
    toast.success("External withdrawal submitted!");
    setStep(1);
    setAmount("");
    setWalletAddress("");
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={["Withdrawal Details", "Confirm Withdrawal"]} currentStep={step} color="blue" />

      {step === 1 && (
        <div className="space-y-4">
          {/* Token + Network */}
          <div className="flex items-center gap-4">
            <img src={selectedAsset.imageLogo} alt={selectedAsset.symbol} className="w-8 h-8" />
            <div>
              <p className="font-semibold">{selectedAsset.symbol}</p>
              <p className="text-xs text-muted-foreground">{selectedNetwork.name}</p>
            </div>
            <img src={selectedNetwork.imageLogo} alt={selectedNetwork.name} className="w-6 h-6 ml-auto" />
          </div>

          {/* Wallet Address */}
          <div>
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.slice(0, 42))}
              placeholder="0x..."
              className="w-full p-3 border rounded-xl"
            />
            {!addressValid && walletAddress.length > 0 && <p className="text-red-500 text-xs mt-1">Invalid ETH address</p>}
          </div>

          {/* Amount */}
          <div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Amount (${selectedAsset.symbol})`}
              className="w-full p-3 border rounded-xl"
            />
            {insufficientMinimum && <p className="text-yellow-500 text-xs mt-1">Minimum withdrawal is 1,000,000 USDT</p>}
          </div>

          {/* Estimated Fee */}
          <p className="text-xs text-muted-foreground">Estimated Network Fee: {networkFee.toFixed(4)} ETH</p>

          {/* Continue */}
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
        <div className="space-y-4">
          <div className="p-4 border rounded-xl space-y-2">
            <p><span className="font-semibold">Asset:</span> {selectedAsset.symbol}</p>
            <p><span className="font-semibold">Amount:</span> {amount}</p>
            <p><span className="font-semibold">Network Fee:</span> {networkFee.toFixed(4)} ETH</p>
            <p><span className="font-semibold">Wallet:</span> {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</p>
            {/* QR code */}
            {selectedAsset.qrCodeImg && <img src={selectedAsset.qrCodeImg} alt="QR Code" className="w-24 h-24 mt-2" />}
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

  if (!selectedAsset) return <p>Select an asset first</p>;

  const amountNumber = Number(amount || 0);
  const walletValid = isValidWalletId(walletId);

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
        <div className="space-y-4">
          {/* Token info */}
          <div className="flex items-center gap-4">
            <img src={selectedAsset.imageLogo} alt={selectedAsset.symbol} className="w-8 h-8" />
            <p className="font-semibold">{selectedAsset.symbol}</p>
          </div>

          {/* WalletID */}
          <input
            value={walletId}
            onChange={(e) => setWalletId(e.target.value.toUpperCase())}
            placeholder="ARR-12345"
            className="w-full p-3 border rounded-xl"
          />
          {!walletValid && walletId.length > 0 && <p className="text-red-500 text-xs mt-1">Invalid WalletID</p>}

          {/* Amount */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${selectedAsset.symbol})`}
            className="w-full p-3 border rounded-xl"
          />

          {/* Continue */}
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
        <div className="space-y-4">
          <div className="p-4 border rounded-xl space-y-1">
            <p><span className="font-semibold">Recipient:</span> {walletId}</p>
            <p><span className="font-semibold">Asset:</span> {selectedAsset.symbol}</p>
            <p><span className="font-semibold">Amount:</span> {amount}</p>
            <p className="text-emerald-600 font-medium">Status: Instant Transfer</p>
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