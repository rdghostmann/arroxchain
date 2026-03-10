// Withdrawals2.jsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation"
/* ----------------------------------
   API Helper — calls /api/saveWithdrawal
---------------------------------- */
async function saveWithdrawal(withdrawalData) {
  const res = await fetch("/api/saveWithdrawal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withdrawalData),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || "Request failed");
  }

  return res.json();
}

/* ----------------------------------
   Wallet Validators
---------------------------------- */
const validators = {
  ETH: {
    Ethereum: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
    Polygon: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
  },
  BTC: {
    Bitcoin: (addr) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(addr),
  },
  USDT: {
    ERC20: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
    // Fixed: was "Tron" but network name in tokens is "TRC20"
    TRC20: (addr) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr),
  },
  SOL: {
    Solana: (addr) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr),
  },
  DOGE: {
    Dogecoin: (addr) => /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/.test(addr),
  },
};

const maxLengths = {
  Ethereum: 42,
  Polygon: 42,
  ERC20: 42,
  TRC20: 34, // Fixed: was "Tron"
  Bitcoin: 42,
  Solana: 44,
  Dogecoin: 34,
};

const isValidWalletId = (id) => /^ARR-\d{5,}$/.test(id);

/* ----------------------------------
   Shared Loading Overlay
---------------------------------- */
function LoadingOverlay({ message, color = "blue" }) {
  const spinnerColor = color === "emerald" ? "border-emerald-600" : "border-blue-600";
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="p-6 rounded-xl flex flex-col items-center gap-4">
        <div className={`animate-spin h-10 w-10 border-4 ${spinnerColor} border-t-transparent rounded-full`} />
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
    </div>
  );
}

/* ==================================
   EXTERNAL WITHDRAWAL
================================== */
export function ExternalWithdrawal({ selectedAsset, selectedNetwork }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!selectedAsset || !selectedNetwork) {
    return <p className="text-sm text-muted-foreground">Select a token and network first</p>;
  }

  const addressValid = validators[selectedAsset.symbol]?.[selectedNetwork.name]
    ? validators[selectedAsset.symbol][selectedNetwork.name](walletAddress)
    : walletAddress.length > 0; // fallback: just require non-empty

  const amountValid = Number(amount) > 0;

  const router = useRouter();

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await saveWithdrawal({
        type: "external",
        asset: selectedAsset.symbol,
        network: selectedNetwork.name,
        amount: Number(amount),
        walletAddress,
        networkFee: 0,
      });

      toast.success("Withdrawal submitted!");
      router.push("/dashboard");

      // Reset form
      setStep(1);
      setAmount("");
      setWalletAddress("");

    } catch (err) {
      toast.error(err.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const walletPlaceholder = (() => {
    switch (selectedAsset.symbol) {
      case "BTC": return "bc1...";
      case "ETH": return "0x...";
      case "USDT": return selectedNetwork.name === "TRC20" ? "T..." : "0x...";
      case "SOL": return "Enter Solana address";
      case "DOGE": return "D...";
      default: return "Wallet address";
    }
  })();

  return (
    <div className="space-y-6">
      {loading && <LoadingOverlay message="Processing withdrawal..." color="blue" />}

      <StepIndicator
        steps={["Withdrawal Details", "Confirm Withdrawal"]}
        currentStep={step}
        color="blue"
      />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Asset header */}
          <div className="flex items-center gap-4">
            <Image
              src={selectedAsset.imageLogo}
              alt={selectedAsset.symbol}
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div>
              <p className="font-semibold">{selectedAsset.symbol}</p>
              <p className="text-xs text-muted-foreground">{selectedNetwork.name}</p>
            </div>
          </div>

          {/* Wallet address */}
          <div>
            <Input
              value={walletAddress}
              onChange={(e) =>
                setWalletAddress(e.target.value.slice(0, maxLengths[selectedNetwork.name] || 44))
              }
              placeholder={walletPlaceholder}
              className="w-full p-3 border rounded-xl"
            />
            {walletAddress.length > 0 && !addressValid && (
              <p className="text-red-500 text-xs mt-1">
                Invalid {selectedNetwork.name} address
              </p>
            )}
          </div>

          {/* Amount */}
          <Input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${selectedAsset.symbol})`}
            className="w-full p-3 border rounded-xl"
          />

          <Button
            disabled={!addressValid || !amountValid}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setStep(2);
              }, 1500);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 border rounded-xl space-y-2">
            {[
              { label: "Asset", value: selectedAsset.symbol },
              { label: "Network", value: selectedNetwork.name },
              { label: "Amount", value: `${amount} ${selectedAsset.symbol}` },
              { label: "Wallet", value: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="font-semibold">{label}:</p>
                <p>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="px-6 py-2 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================================
   INTERNAL TRANSFER
================================== */
export function InternalWithdrawal({ selectedAsset, selectedNetwork }) {
  const [step, setStep] = useState(1);
  const [walletId, setWalletId] = useState("");
  const [externalWalletAddress, setExternalWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!selectedAsset || !selectedNetwork) {
    return <p className="text-sm text-muted-foreground">Select a token and network first</p>;
  }

  const walletValid = isValidWalletId(walletId);
  const amountValid = Number(amount) > 0;

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await saveWithdrawal({
        type: "internal",
        asset: selectedAsset.symbol,
        amount: Number(amount),
        walletId,
        externalWalletAddress: externalWalletAddress || null,
      });

      toast.success("Internal transfer successful!");
      router.push("/dashboard");

      // Reset form
      setStep(1);
      setWalletId("");
      setExternalWalletAddress("");
      setAmount("");
    } catch (err) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <LoadingOverlay message="Processing transfer..." color="emerald" />}

      <StepIndicator
        steps={["Transfer Details", "Confirm Transfer"]}
        currentStep={step}
        color="emerald"
      />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Asset header */}
          <div className="flex items-center gap-4">
            <Image
              src={selectedAsset.imageLogo}
              alt={selectedAsset.symbol}
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div>
              <p className="font-semibold">{selectedAsset.symbol}</p>
              <p className="text-xs text-muted-foreground">{selectedNetwork.name}</p>
            </div>
          </div>

          {/* Wallet ID */}
          <div>
            <Input
              value={walletId}
              onChange={(e) => setWalletId(e.target.value.toUpperCase())}
              placeholder="ARR-12345"
              className="w-full p-3 border rounded-xl"
            />
            {walletId.length > 0 && !walletValid && (
              <p className="text-red-500 text-xs mt-1">
                Invalid Wallet ID — must match format ARR-XXXXX
              </p>
            )}
          </div>

          {/* Internal wallet address (optional) */}
          <Input
            value={externalWalletAddress}
            onChange={(e) => setExternalWalletAddress(e.target.value)}
            placeholder="Internal Wallet Address (optional)"
            className="w-full p-3 border rounded-xl"
          />

          {/* Amount */}
          <Input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${selectedAsset.symbol})`}
            className="w-full p-3 border rounded-xl"
          />

          <Button
            disabled={!walletValid || !amountValid}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setStep(2);
              }, 1500);
            }}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 border rounded-xl space-y-2">
            {[
              { label: "Recipient Wallet ID", value: walletId },
              { label: "Wallet Address", value: externalWalletAddress || "-" },
              { label: "Asset", value: selectedAsset.symbol },
              { label: "Amount", value: `${amount} ${selectedAsset.symbol}` },
              { label: "Status", value: "Instant Transfer", className: "text-emerald-600" },
            ].map(({ label, value, className }) => (
              <p key={label} className="flex gap-4 items-center justify-between">
                <span className="font-semibold">{label}:</span>
                <span className={className}>{value}</span>
              </p>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="px-6 py-2 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}