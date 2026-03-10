// Withdrawals2.jsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { saveWithdrawal } from "@/controllers/saveWithdrawals";

/* ----------------------------------
Wallet Validators
---------------------------------- */
const validators = {
    ETH: { Ethereum: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr), Polygon: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr) },
    BTC: { Bitcoin: (addr) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(addr) },
    USDT: { ERC20: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr), Tron: (addr) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr) },
    SOL: { Solana: (addr) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr) },
    DOGE: { Dogecoin: (addr) => /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/.test(addr) },
};

const maxLengths = { Ethereum: 42, Polygon: 42, ERC20: 42, Tron: 34, Bitcoin: 42, Solana: 44, Dogecoin: 34 };
const isValidWalletId = (id) => /^ARR-\d{5,}$/.test(id);

/* ==================================
EXTERNAL WITHDRAWAL
================================== */
export function ExternalWithdrawal({ selectedAsset, selectedNetwork, userAssetsData }) {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);

    if (!selectedAsset || !selectedNetwork) return <p>Select a token and network first</p>;

    const addressValid = validators[selectedAsset.symbol]?.[selectedNetwork.name]
        ? validators[selectedAsset.symbol][selectedNetwork.name](walletAddress)
        : true;

    const handleConfirm = async () => {
        try {
            await saveWithdrawal({
                type: "external",
                asset: selectedAsset.symbol,
                network: selectedNetwork.name,
                amount: Number(amount),
                walletAddress,
                networkFee: 0, // compute dynamically if needed
            });

            toast.success("External withdrawal submitted and is pending!");
            setStep(1);
            setAmount("");
            setWalletAddress("");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const walletPlaceholder = (() => {
        switch (selectedAsset.symbol) {
            case "BTC": return "bc1...";
            case "ETH": case "USDT": return selectedNetwork.name === "Tron" ? "T..." : "0x...";
            case "SOL": return "Enter Solana address";
            case "DOGE": return "D...";
            default: return "Wallet address";
        }
    })();

    return (
        <div className="space-y-6">
            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-transparent p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                        <p className="text-sm font-medium">Processing withdrawal...</p>
                    </div>
                </div>
            )}

            <StepIndicator steps={["Withdrawal Details", "Confirm Withdrawal"]} currentStep={step} color="blue" />

            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Image src={selectedAsset.imageLogo} alt={selectedAsset.symbol} className="w-8 h-8" />
                        <div>
                            <p className="font-semibold">{selectedAsset.symbol}</p>
                            <p className="text-xs text-muted-foreground">{selectedNetwork.name}</p>
                        </div>
                        <Image src={selectedAsset.imageLogo} alt={selectedNetwork.name} className="w-6 h-6 ml-auto" />
                    </div>

                    <Input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value.slice(0, maxLengths[selectedNetwork.name] || 44))}
                        placeholder={walletPlaceholder}
                        className="w-full p-3 border rounded-xl"
                    />
                    {!addressValid && walletAddress.length > 0 && (
                        <p className="text-red-500 text-xs mt-1">Invalid {selectedNetwork.name} address</p>
                    )}

                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Amount (${selectedAsset.symbol})`}
                        className="w-full p-3 border rounded-xl"
                    />

                    <Button
                        disabled={!addressValid || !amount}
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => {
                                setLoading(false);
                                setStep(2);
                            }, 2000);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                    >
                        Continue
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="p-4 border rounded-xl space-y-2">
                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold">Asset:</p>
                            <p>{selectedAsset.symbol}</p>
                        </div>
                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold">Amount:</p>
                            <p>{amount} {selectedAsset.symbol}</p>
                        </div>
                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold">Wallet:</p>
                            <p>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">
                            Back
                        </Button>

                        <Button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
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
export function InternalWithdrawal({ selectedAsset, selectedNetwork, userAssetsData }) {
    const [step, setStep] = useState(1);
    const [walletId, setWalletId] = useState("");
    const [externalWalletAddress, setExternalWalletAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    if (!selectedAsset || !selectedNetwork) return <p>Select asset</p>;

    const walletValid = isValidWalletId(walletId);

    const handleConfirm = async () => {
        try {
            await saveWithdrawal({
                type: "internal",
                asset: selectedAsset.symbol,
                amount: Number(amount),
                walletId,
                externalWalletAddress,
            });

            toast.success("Internal transfer submitted!");
            setStep(1);
            setWalletId("");
            setExternalWalletAddress("");
            setAmount("");

        } catch (err) {
            toast.error(err.message);
        }
    };
    return (
        <div className="space-y-6">
            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-transparent p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
                        <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
                        <p className="text-sm font-medium">Processing transfer...</p>
                    </div>
                </div>
            )}

            <StepIndicator steps={["Transfer Details", "Confirm Transfer"]} currentStep={step} color="emerald" />

            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Image src={selectedAsset.imageLogo} alt={selectedAsset.symbol} width={32} height={32} className="w-8 h-8" />
                        <div>
                            <p className="font-semibold">{selectedAsset.symbol}</p>
                            <p className="text-xs text-muted-foreground">{selectedNetwork.name}</p>
                        </div>
                        <Image src={selectedAsset.imageLogo} alt={selectedAsset.symbol} width={32} height={32} className="w-6 h-6 ml-auto" />
                    </div>

                    <Input
                        value={walletId}
                        onChange={(e) => setWalletId(e.target.value.toUpperCase())}
                        placeholder="ARR-12345"
                        className="w-full p-3 border rounded-xl"
                    />
                    {!walletValid && walletId.length > 0 && (
                        <p className="text-red-500 text-xs mt-1">Invalid WalletID</p>
                    )}

                    <Input
                        value={externalWalletAddress}
                        onChange={(e) => setExternalWalletAddress(e.target.value)}
                        placeholder="Internal Wallet Address"
                        className="w-full p-3 border rounded-xl"
                    />

                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Amount (${selectedAsset.symbol})`}
                        className="w-full p-3 border rounded-xl"
                    />

                    <Button
                        disabled={!walletValid || !amount}
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => {
                                setLoading(false);
                                setStep(2);
                            }, 2000);
                        }}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50"
                    >
                        Continue
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="p-4 border rounded-xl space-y-1">
                        <p className="flex gap-4 items-center justify-between">
                            <span className="font-semibold">Recipient WalletID:</span>
                            <span>{walletId}</span>
                        </p>
                        <p className="flex gap-4 items-center justify-between">
                            <span className="font-semibold">Wallet Address:</span>
                            <span>{externalWalletAddress || "-"}</span>
                        </p>
                        <p className="flex gap-4 items-center justify-between">
                            <span className="font-semibold">Asset:</span>
                            <span>{selectedAsset.symbol}</span>
                        </p>
                        <p className="flex gap-4 items-center justify-between">
                            <span className="font-semibold">Amount:</span>
                            <span>{amount} {selectedAsset.symbol}</span>
                        </p>
                        <p className="flex gap-4 items-center justify-between">
                            <span>Status:</span>
                            <span className="text-emerald-600">Instant Transfer</span>
                        </p>
                    </div>

                    <div className="flex justify-between">
                        <Button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">
                            Back
                        </Button>
                        <Button onClick={handleConfirm} className="px-6 py-2 bg-emerald-600 text-white rounded-xl">
                            Confirm
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}