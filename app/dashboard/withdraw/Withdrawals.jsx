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
Validators
---------------------------------- */

const isValidEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const isValidWalletId = (id) => /^ARR-\d{5,}$/.test(id);

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

    const addressValid = isValidEthAddress(walletAddress);

    const handleConfirm = async () => {
        await onConfirm({
            type: "external",
            asset: selectedAsset.symbol,
            network: selectedNetwork.name,
            amount: amountNumber,
            walletAddress,
            networkFee,
        });

        toast.success("External withdrawal submitted!");

        setStep(1);
        setAmount("");
        setWalletAddress("");
    };

    return (
        <div className="space-y-6">

            {/* Loading Overlay */}

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

            {/* STEP 1 */}

            {step === 1 && (
                <div className="space-y-4">

                    {/* Token + Network */}

                    <div className="flex items-center gap-4">
                        <img
                            src={selectedAsset.imageLogo}
                            alt={selectedAsset.symbol}
                            className="w-8 h-8"
                        />

                        <div>
                            <p className="font-semibold">{selectedAsset.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                                {selectedNetwork.name}
                            </p>
                        </div>

                        <img
                            src={selectedNetwork.imageLogo}
                            alt={selectedNetwork.name}
                            className="w-6 h-6 ml-auto"
                        />
                    </div>

                    {/* Wallet Address */}

                    <div>
                        <Input
                            value={walletAddress}
                            onChange={(e) =>
                                setWalletAddress(e.target.value.slice(0, 42))
                            }
                            placeholder="0x..."
                            className="w-full p-3 border rounded-xl"
                        />

                        {!addressValid && walletAddress.length > 0 && (
                            <p className="text-red-500 text-xs mt-1">
                                Invalid ETH address
                            </p>
                        )}
                    </div>

                    {/* Amount */}

                    <div>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Amount (${selectedAsset.symbol})`}
                            className="w-full p-3 border rounded-xl"
                        />

                        {insufficientMinimum && (
                            <p className="text-yellow-500 text-xs mt-1">
                                Minimum withdrawal is 1,000,000 USDT
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Estimated Network Fee: {networkFee.toFixed(4)} ETH
                    </p>

                    <Button
                        disabled={!addressValid || amountNumber <= 0 || insufficientMinimum}
                        onClick={() => {
                            setLoading(true);

                            setTimeout(() => {
                                setLoading(false);
                                setStep(2);
                            }, 9000);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                    >
                        Continue
                    </Button>
                </div>
            )}

            {/* STEP 2 */}

            {step === 2 && (
                <div className="space-y-4">

                    <div className="p-4 border rounded-xl space-y-2">
                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold"> Asset: </p>
                            <p> {selectedAsset.symbol} </p>
                        </div>

                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold"> Amount:  </p>
                            <p> {amount}</p>
                        </div>
                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold"> Network Fee: </p>
                            <p> {networkFee.toFixed(4)} ETH </p>
                        </div>
                        <div className="flex items-center gap-4 justify-between">
                            <p className="font-semibold"> Wallet: </p>
                            <p>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                        </div>

                    </div>

                    <div className="flex justify-between">
                        <Button
                            onClick={() => setStep(1)}
                            className="px-6 py-2 border rounded-xl"
                        >
                            Back
                        </Button>

                        <Button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl"
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

export function InternalWithdrawal({
    selectedAsset,
    selectedNetwork,
    onConfirm,
}) {
    const [step, setStep] = useState(1);
    const [walletId, setWalletId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    if (!selectedAsset || !selectedNetwork) return <p>Select asset</p>;

    const amountNumber = Number(amount || 0);
    const walletValid = isValidWalletId(walletId);

    const handleConfirm = async () => {
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
    };

    return (
        <div className="space-y-6">

            {/* Loading Overlay */}

            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-transparent p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
                        <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
                        <p className="text-sm font-medium">Processing transfer...</p>
                    </div>
                </div>
            )}

            <StepIndicator
                steps={["Transfer Details", "Confirm Transfer"]}
                currentStep={step}
                color="emerald"
            />

            {step === 1 && (
                <div className="space-y-4">

                    <div className="flex items-center gap-4">
                        <Image
                            src={selectedAsset.imageLogo}
                            alt={selectedAsset.symbol}
                            className="w-8 h-8"
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
                            className="w-6 h-6 ml-auto"
                            width={32}
                            height={32}
                        />
                    </div>

                    <Input
                        value={walletId}
                        onChange={(e) =>
                            setWalletId(e.target.value.toUpperCase())
                        }
                        placeholder="ARR-12345"
                        className="w-full p-3 border rounded-xl"
                    />

                    {!walletValid && walletId.length > 0 && (
                        <p className="text-red-500 text-xs mt-1">
                            Invalid WalletID
                        </p>
                    )}

                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Amount (${selectedAsset.symbol})`}
                        className="w-full p-3 border rounded-xl"
                    />

                    <Button
                        disabled={!walletValid || amountNumber <= 0}
                        onClick={() => {
                            setLoading(true);

                            setTimeout(() => {
                                setLoading(false);
                                setStep(2);
                            }, 9000);
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
                        <p>
                            <span className="font-semibold">Recipient:</span>{" "}
                            {walletId}
                        </p>

                        <p>
                            <span className="font-semibold">Asset:</span>{" "}
                            {selectedAsset.symbol}
                        </p>

                        <p>
                            <span className="font-semibold">Amount:</span> {amount}
                        </p>

                        <p className="text-emerald-600 font-medium">
                            Status: Instant Transfer
                        </p>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2 border rounded-xl"
                        >
                            Back
                        </button>

                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}