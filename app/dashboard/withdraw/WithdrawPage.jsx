"use client";

import { useState } from "react";
import NavHeader from "../components/NavHeader/NavHeader";
import { Card } from "@/components/ui/card";
import { Send, Zap } from "lucide-react";

/* --------------------------------------------------
   CONSTANTS
-------------------------------------------------- */

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;
const COMPANY_WALLET = "0x0688353c8f46299781e1a33ade320e25983d2402";

const MOCK_INTERNAL_USERS = [
  { id: "user1", name: "Alice Johnson", email: "alice@company.com" },
  { id: "user2", name: "Bob Smith", email: "bob@company.com" },
  { id: "user3", name: "Carol Williams", email: "carol@company.com" },
];

/* --------------------------------------------------
   WITHDRAW TYPE SELECTOR
-------------------------------------------------- */

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
            Transfer between accounts
          </p>
        </div>
      </button>
    </div>
  );
}

/* --------------------------------------------------
   EXTERNAL WITHDRAW
-------------------------------------------------- */

function ExternalWithdrawal() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const amountNumber = Number(amount || 0);
  const withdrawalUsd = amountNumber;
  const withdrawalMillions = withdrawalUsd / 1_000_000;

  const networkFeeEth =
    withdrawalMillions > 0
      ? withdrawalMillions * ETH_FEE_PER_MILLION_USDT
      : 0;

  const insufficientMinimum =
    withdrawalUsd > 0 && withdrawalUsd < MIN_WITHDRAW_USDT;

  return (
    <div className="space-y-6">

      {/* STEP INDICATOR */}
      <div className="flex justify-between text-xs font-medium">
        <span className={step === 1 ? "text-blue-600" : "text-muted-foreground"}>
          1. Details
        </span>
        <span className={step === 2 ? "text-blue-600" : "text-muted-foreground"}>
          2. Summary
        </span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <input
            placeholder="Wallet Address"
            value={walletAddress}
            onChange={(e) =>
              setWalletAddress(e.target.value.slice(0, 42))
            }
            className="w-full p-3 rounded-xl border bg-background"
          />

          <input
            type="number"
            placeholder="Amount (USDT)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl border bg-background"
          />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Estimated Network Fee: {networkFeeEth.toFixed(4)} ETH
            </p>
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
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{amount} USDT</span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee</span>
              <span>{networkFeeEth.toFixed(4)} ETH</span>
            </div>
          </div>

          <div className="p-4 border rounded-xl text-xs">
            Deposit network fee to:
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
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------
   INTERNAL TRANSFER
-------------------------------------------------- */

function InternalWithdrawal() {
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");

  const amountNumber = Number(amount || 0);

  return (
    <div className="space-y-6">

      <div className="flex justify-between text-xs font-medium">
        <span className={step === 1 ? "text-emerald-600" : "text-muted-foreground"}>
          1. Recipient
        </span>
        <span className={step === 2 ? "text-emerald-600" : "text-muted-foreground"}>
          2. Confirm
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          {MOCK_INTERNAL_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 rounded-xl border text-left ${
                selectedUser?.id === user.id
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border"
              }`}
            >
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </button>
          ))}

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl border"
          />

          <div className="flex justify-end">
            <button
              disabled={!selectedUser || amountNumber <= 0}
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
          <div className="p-4 rounded-xl border bg-emerald-500/10 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Recipient</span>
              <span>{selectedUser?.name}</span>
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

/* --------------------------------------------------
   MAIN PAGE
-------------------------------------------------- */

export default function WithdrawPage() {
  const [withdrawalType, setWithdrawalType] = useState("external");

  return (
    <div className="relative min-h-screen w-full">
      <NavHeader className="text-foreground" />

      <div className="flex flex-1 items-center justify-center px-2 sm:px-0 mb-8">
        <Card className="w-full max-w-3xl p-6 space-y-6">
          <h2 className="text-2xl font-bold">Withdraw Assets</h2>

          <WithdrawalTypeSelector
            withdrawalType={withdrawalType}
            setWithdrawalType={setWithdrawalType}
          />

          <div className="border-t pt-6">
            {withdrawalType === "external" ? (
              <ExternalWithdrawal />
            ) : (
              <InternalWithdrawal />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}