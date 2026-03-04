// DepositPage.jsx


'use client';

import { useState, useEffect } from 'react';
import {
    Wallet,
    Shield,
    Copy,
    Coins,
    BanknoteArrowUp,
    EyeOff,
    Eye,
    Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { truncateAddress } from '@/lib/utils';

export default function DepositPage() {
    const [userAssets, setUserAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    const [transferType, setTransferType] = useState('external');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDT');
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [transactionPin, setTransactionPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [step, setStep] = useState('form');
    const [remainingTime, setRemainingTime] = useState(0);

    // 🔥 Fetch real user assets
    useEffect(() => {
        async function fetchAssets() {
            try {
                const res = await fetch('/api/user-assets');
                const data = await res.json();
                setUserAssets(data.assets || []);

                // Auto-select first owned asset if exists
                if (data.assets?.length > 0) {
                    setSelectedToken(data.assets[0].coin.toUpperCase());
                }
            } catch {
                setUserAssets([]);
            } finally {
                setLoadingAssets(false);
            }
        }

        fetchAssets();
    }, []);

    const tokens = [
        {
            symbol: 'USDT',
            name: 'Tether',
            imageLogo: '/tether-usdt-logo.png',
            color: 'from-green-500 to-blue-500',
            receiveWalletAddress: '0x60B89377D92cA54D86f0319D160e4171E4761A9b',
            qrCodeImg: '/eth-qrcode-img.png',
            networks: [
                { name: 'ERC20', imageLogo: '/tether-usdt-logo.png' },
                { name: 'Tron', imageLogo: '/tron-trx-logo.png' },
            ],
        },
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            imageLogo: '/bitcoin-btc-logo.png',
            color: 'from-orange-500 to-amber-500',
            receiveWalletAddress: 'bc1qz4k4w6jq6mq0ku9t5cksjcf6upkjfy9f0s9k4n',
            qrCodeImg: '/btc-qrcode-img.png',
            networks: [{ name: 'Bitcoin', imageLogo: '/bitcoin-btc-logo.png' }],
        },
        {
            symbol: 'ETH',
            name: 'Ethereum',
            imageLogo: '/ethereum-eth-logo.png',
            color: 'from-purple-500 to-pink-500',
            receiveWalletAddress: '0x0688353c8f46299781e1a33ade320e25983d2402',
            qrCodeImg: '/eth-qrcode-img.png',
            networks: [
                { name: 'Ethereum', imageLogo: '/ethereum-eth-logo.png' },
                { name: 'Polygon', imageLogo: '/polygon-matic-logo.png' },
            ],
        },
        {
            symbol: 'SOL',
            name: 'Solana',
            imageLogo: '/solana-sol-logo.png',
            color: 'from-purple-500 to-pink-500',
            receiveWalletAddress: '7xobDDbnnywZR6DY9UP1jS3QuvkFAGwVnUfugcGqjXVQ',
            qrCodeImg: '/sol-qrcode-img.png',
            networks: [{ name: 'Solana', imageLogo: '/sol-logo.png' }],
        },
        {
            symbol: 'DOGE',
            name: 'Dogecoin',
            imageLogo: '/dogecoin-doge-logo.png',
            color: 'from-yellow-500 to-orange-400',
            receiveWalletAddress: 'DRhAMz5YH6uucEZWFuJrNznbrEf8yvD2R6',
            qrCodeImg: '/doge-qrcode-img.png',
            networks: [
                { name: 'Dogecoin', imageLogo: '/dogecoin-doge-logo.png' },
            ],
        },
    ];

    const currentToken =
        tokens.find((t) => t.symbol === selectedToken) || tokens[0];

    // Auto-set network
    useEffect(() => {
        if (currentToken?.networks?.length > 0) {
            setSelectedNetwork(currentToken.networks[0].name);
        }
    }, [currentToken]);

    // Auto-fill external wallet
    useEffect(() => {
        if (transferType === 'external') {
            setWalletAddress(currentToken.receiveWalletAddress);
        }
    }, [transferType, currentToken.receiveWalletAddress]);

    // Restore summary from cookie
    useEffect(() => {
        const expiresAt = Cookies.get('DepositTransacTokenExpires');
        if (!expiresAt) return;

        const timeLeft = Math.max(Number(expiresAt) - Date.now(), 0);
        if (timeLeft <= 0) return;

        setStep('summary');
        setRemainingTime(Math.floor(timeLeft / 1000));
    }, []);

    // Countdown
    useEffect(() => {
        if (step === 'summary' && remainingTime > 0) {
            const interval = setInterval(() => {
                setRemainingTime((t) => {
                    if (t <= 1) {
                        Cookies.remove('DepositTransacToken');
                        Cookies.remove('DepositTransacTokenExpires');
                        setStep('form');
                        setAmount('');
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [step, remainingTime]);

    // Validation
    const amountNumber = Number(amount);
    const invalidAmount = amountNumber <= 0 || isNaN(amountNumber);
    const missingWallet =
        transferType === 'internal' ? walletAddress.trim().length === 0 : false;
    const pinRequired = transferType === 'internal';
    const missingPin = pinRequired && transactionPin.trim().length === 0;
    const disableContinue = invalidAmount || missingWallet || missingPin;

    const userTokenBalance =
        userAssets.find((a) => a.coin.toUpperCase() === selectedToken)
            ?.amount || 0;

    const handleContinue = () => {
        if (transferType === 'external') {
            const expiresAt = Date.now() + 90_000;
            Cookies.set('DepositTransacTokenExpires', expiresAt.toString(), {
                expires: 1,
            });
        }
        setStep('summary');
    };

    const copyToClipboard = (value) => {
        navigator.clipboard.writeText(value);
        toast.success('Copied!');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 mb-7">
            <div className="w-full max-w-3xl">
                {/* Header & Notice */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Choose Deposit Type</h1>
                    <p className="text-gray-400">Add funds to your account</p>

                    {/* Notice as styled unordered list */}
                    <div className="bg-linear-to-br from-cyan-900/20 to-cyan-800/10 rounded-2xl p-6 border border-cyan-500/20 shadow-xl mb-8">
                        <div className="mb-4">
                            {/* <h3 className="font-bold text-lg text-white mb-1">Important Notice</h3> */}
                            <p className="text-cyan-300 text-sm font-medium">Follow the correct deposit procedure</p>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start justify-between gap-3">
                                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex justify-center items-center mt-0.5 shrink-0 border border-cyan-500/30">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                </div>
                                <span className="flex-1 text-left text-xs md:text-sm text-gray-200">
                                    Use External Transfer for amounts below 1,000,000 USDT (wallet address only).
                                </span>
                            </li>

                            <li className="flex items-start justify-between gap-3">
                                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex justify-center items-center mt-0.5 shrink-0 border border-cyan-500/30">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                </div>
                                <span className="flex-1 text-left text-xs md:text-sm text-gray-200">
                                    Use Internal Transfer for amounts above 1,000,000 USDT (wallet ID & compliance address).
                                </span>
                            </li>

                            <li className="flex items-start justify-between gap-3">
                                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex justify-center items-center mt-0.5 shrink-0 border border-cyan-500/30">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                </div>
                                <span className="flex-1 text-left text-xs md:text-sm text-gray-200">
                                    Please follow the correct procedure to avoid loss of funds.
                                </span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Balance Display */}
                {!loadingAssets && (
                    <div className="mb-6 text-sm text-gray-400">
                        Current Balance:{" "}
                        <span className="text-white font-semibold">
                            {userTokenBalance.toFixed(4)} {selectedToken}
                        </span>
                    </div>
                )}

                {step === 'form' && (
                    <>
                        <Tabs
                            value={transferType}
                            onValueChange={(v) => {
                                setTransferType(v);
                                setWalletAddress('');
                                setAmount('');
                                setTransactionPin('');
                            }}
                            className="mb-6"
                        >
                            <TabsList className="grid grid-cols-2 bg-slate-800">
                                <TabsTrigger value="external">
                                    External Transfer
                                </TabsTrigger>
                                <TabsTrigger value="internal">
                                    Internal Transfer
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">

                            {/* Token Select */}
                            <div>
                                <label className="text-sm text-gray-300 mb-2 block">
                                    Select Token
                                </label>
                                <Select
                                    value={selectedToken}
                                    onValueChange={setSelectedToken}
                                >
                                    <SelectTrigger className="bg-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800">
                                        {tokens.map((token) => (
                                            <SelectItem
                                                key={token.symbol}
                                                value={token.symbol}
                                            >
                                                {token.name} ({token.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-sm text-gray-300 mb-2 block">
                                    Amount
                                </label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-white"
                                />
                                {invalidAmount && (
                                    <p className="text-xs text-red-400 mt-1">
                                        Enter valid amount
                                    </p>
                                )}
                            </div>

                            <Button
                                disabled={disableContinue}
                                onClick={handleContinue}
                                className="w-full bg-blue-600"
                            >
                                Continue Deposit
                            </Button>
                        </div>
                    </>
                )}

                {step === 'summary' && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
                        <Image
                            src={currentToken.qrCodeImg}
                            alt="QR"
                            width={220}
                            height={220}
                            className="mx-auto"
                        />

                        <div className="flex justify-between">
                            <span>Token:</span>
                            <span>{selectedToken}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Amount:</span>
                            <span>{amount}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>Wallet:</span>
                            <span className="flex items-center gap-2">
                                {truncateAddress(walletAddress)}
                                <Button
                                    size="icon"
                                    onClick={() => copyToClipboard(walletAddress)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}