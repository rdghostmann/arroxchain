// Withdrawals.jsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;

/* ----------------------------------
Wallet Validators
---------------------------------- */

const validators = {
    ETH: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
    BTC: (addr) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(addr),
    TRON: (addr) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr),
};

const getAddressPlaceholder = (symbol, network) => {
    if (symbol === "BTC") return "bc1q...";
    if (network === "Tron") return "T...";
    if (network === "ERC20" || symbol === "ETH") return "0x...";
    if (network === "Polygon") return "0x...";
    return "Wallet address";
};

const isValidAddress = (symbol, network, addr) => {

    if (!addr) return false;

    if (symbol === "BTC") return validators.BTC(addr);

    if (network === "Tron") return validators.TRON(addr);

    if (network === "ERC20" || network === "Polygon" || symbol === "ETH")
        return validators.ETH(addr);

    return false;
};

/* ==================================
EXTERNAL WITHDRAWAL
================================== */

export function ExternalWithdrawal({
    selectedAsset,
    selectedNetwork,
    onConfirm,
}) {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);

    if (!selectedAsset || !selectedNetwork)
        return <p>Select a token and network first</p>;

    const amountNumber = Number(amount || 0);
    const withdrawalMillions = amountNumber / 1_000_000;
    const networkFee = withdrawalMillions * ETH_FEE_PER_MILLION_USDT;

    const insufficientMinimum =
        amountNumber > 0 && amountNumber < MIN_WITHDRAW_USDT;

    const addressValid = isValidAddress(
        selectedAsset.symbol,
        selectedNetwork.name,
        walletAddress
    );

    const handleConfirm = async () => {

        setLoading(true);

        await onConfirm({
            type: "external",
            asset: selectedAsset.symbol,
            network: selectedNetwork.name,
            amount: amountNumber,
            walletAddress,
            networkFee,
        });

        setLoading(false);

        toast.success("Withdrawal submitted");

        setStep(1);
        setAmount("");
        setWalletAddress("");
    };

    return (
        <div className="space-y-6">

            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                        <p className="text-sm font-medium">Processing withdrawal...</p>
                    </div>
                </div>
            )}

            <StepIndicator
                steps={["Withdrawal Details", "Confirm Withdrawal"]}
                currentStep={step}
                color="blue"
            />

            {step === 1 && (
                <div className="space-y-4">

                    <div className="flex items-center gap-4">
                        <Image
                            src={selectedAsset.imageLogo}
                            alt={selectedAsset.symbol}
                            width={32}
                            height={32}
                        />

                        <div>
                            <p className="font-semibold">{selectedAsset.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                                {selectedNetwork.name}
                            </p>
                        </div>

                        <Image
                            src={selectedNetwork.imageLogo}
                            alt={selectedNetwork.name}
                            width={24}
                            height={24}
                            className="ml-auto"
                        />
                    </div>

                    <Input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={getAddressPlaceholder(
                            selectedAsset.symbol,
                            selectedNetwork.name
                        )}
                    />

                    {!addressValid && walletAddress.length > 0 && (
                        <p className="text-red-500 text-xs">
                            Invalid {selectedAsset.symbol} address
                        </p>
                    )}

                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Amount (${selectedAsset.symbol})`}
                    />

                    {insufficientMinimum && (
                        <p className="text-yellow-500 text-xs">
                            Minimum withdrawal is 1,000,000 USDT
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Estimated Network Fee: {networkFee.toFixed(4)} ETH
                    </p>

                    <Button
                        disabled={!addressValid || amountNumber <= 0 || insufficientMinimum}
                        onClick={() => setStep(2)}
                        className="w-full"
                    >
                        Continue
                    </Button>

                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">

                    <div className="p-4 border rounded-xl space-y-2">

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
                            <span>{networkFee.toFixed(4)} ETH</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Wallet</span>
                            <span>
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </span>
                        </div>

                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>
                            Back
                        </Button>

                        <Button onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </div>

                </div>
            )}
        </div>
    );
}