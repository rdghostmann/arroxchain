// ExternalWithdrawal.jsx
"use client";

import { useWithdrawal } from "./useWithdrawal";
import { StepIndicator } from "./StepIndicator"; // keep StepIndicator separate
import { toast } from "sonner";

const ETH_FEE_PER_MILLION_USDT = 0.25;
const MIN_WITHDRAW_USDT = 990_990;
const COMPANY_WALLET = "0x0688353c8f46299781e1a33ade320e25983d2402";

function isValidEthAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function ExternalWithdrawal({ selectedAsset, onConfirm }) {
    const {
        step, setStep,
        amount, setAmount,
        walletField: walletAddress, setWalletField,
        amountNumber, reset
    } = useWithdrawal();

    if (!selectedAsset) return <p className="text-sm text-muted-foreground">Please select an asset first.</p>;

    const withdrawalMillions = amountNumber / 1_000_000;
    const networkFeeEth = withdrawalMillions > 0 ? withdrawalMillions * ETH_FEE_PER_MILLION_USDT : 0;
    const insufficientMinimum = amountNumber > 0 && amountNumber < MIN_WITHDRAW_USDT;
    const addressValid = isValidEthAddress(walletAddress);

    const handleConfirm = async () => {
        try {
            await onConfirm({
                type: "external",
                asset: selectedAsset.symbol,
                amount: amountNumber,
                walletAddress,
                networkFee: networkFeeEth,
            });
            toast.success("Withdrawal submitted!");
            reset();
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
                            onChange={(e) => setWalletField(e.target.value.slice(0, 42))}
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
                        <div className="flex justify-between"><span>Asset</span><span>{selectedAsset.symbol}</span></div>
                        <div className="flex justify-between"><span>Amount</span><span>{amount}</span></div>
                        <div className="flex justify-between"><span>Network Fee</span><span>{networkFeeEth.toFixed(4)} ETH</span></div>
                        <div className="flex justify-between"><span>Wallet</span><span className="text-xs">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span></div>
                    </div>

                    <div className="border rounded-xl p-3 text-xs bg-yellow-500/10">
                        Network fee must be deposited to:
                        <div className="mt-2 font-mono break-all">{COMPANY_WALLET}</div>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl">Back</button>
                        <button onClick={handleConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Confirm Withdrawal</button>
                    </div>
                </div>
            )}
        </div>
    );
}