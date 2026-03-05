"use client";

import { useState } from "react";

export function useWithdrawal(initialStep = 1) {
  const [step, setStep] = useState(initialStep);
  const [amount, setAmount] = useState("");
  const [walletField, setWalletField] = useState(""); // can be address or walletId

  const amountNumber = Number(amount || 0);

  const reset = () => {
    setStep(1);
    setAmount("");
    setWalletField("");
  };

  return {
    step,
    setStep,
    amount,
    setAmount,
    walletField,
    setWalletField,
    amountNumber,
    reset,
  };
}