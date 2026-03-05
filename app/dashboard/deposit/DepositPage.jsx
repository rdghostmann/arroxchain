// DepositPage.jsx

'use client';

import { useState, useEffect } from 'react';
import { Wallet, Shield, Copy, Coins, BanknoteArrowUp, EyeOff, Eye, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { truncateAddress } from '@/lib/utils';
import NavHeader from '../components/NavHeader/NavHeader';

export default function DepositPage() {
  // Tokens data
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
      networks: [{ name: 'Dogecoin', imageLogo: '/dogecoin-doge-logo.png' }],
    },
  ];

  // State
  const [transferType, setTransferType] = useState('external');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [step, setStep] = useState('form');
  const [remainingTime, setRemainingTime] = useState(0);

  // Current token
  const currentToken = tokens.find((t) => t.symbol === selectedToken) || tokens[0];

  // Set default network when token changes
  useEffect(() => {
    const firstNetwork = currentToken?.networks?.[0]?.name || '';
    setSelectedNetwork(firstNetwork);
  }, [currentToken]);

  // Auto-fill wallet address for external transfer
  useEffect(() => {
    if (transferType === 'external') {
      setWalletAddress(currentToken.receiveWalletAddress);
    } else {
      setWalletAddress('');
    }
  }, [transferType, currentToken.receiveWalletAddress]);

  // Restore deposit summary from cookies
  useEffect(() => {
    const depositToken = Cookies.get('DepositTransacToken');
    const expiresAt = Cookies.get('DepositTransacTokenExpires');

    if (!depositToken || !expiresAt) return;

    const timeLeft = Math.max(Number(expiresAt) - Date.now(), 0);
    if (timeLeft <= 0) return;

    setStep('summary');
    setRemainingTime(Math.floor(timeLeft / 1000));
    setWalletAddress(currentToken.receiveWalletAddress);
  }, [currentToken.receiveWalletAddress]);

  // Countdown timer for summary expiration
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
  const missingWallet = transferType === 'internal' && walletAddress.trim().length === 0;
  const pinRequired = transferType === 'internal';
  const missingPin = pinRequired && transactionPin.trim().length === 0;
  const disableContinue = invalidAmount || missingWallet || missingPin;

  // Clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied!');
  };

  const handleContinue = () => {
    if (transferType === 'external') {
      const token = Math.random().toString(36).substring(2);
      const expiresAt = Date.now() + 90_000; // 1:30 min
      Cookies.set('DepositTransacToken', token, { expires: 1 });
      Cookies.set('DepositTransacTokenExpires', expiresAt.toString(), { expires: 1 });
    }
    setStep('summary');
  };

  return (
    <div className="min-h-screen flex flex-1 items-center justify-center px-2 sm:px-0 mb-8 p-4 md:p-8">
      <div className="w-full md:max-w-3xl mx-auto">
        {/* Header */}
          <NavHeader className="text-foreground" />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Choose Deposit Type</h1>
          <p className="text-gray-400">Add funds to your account</p>
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <>
            <Tabs
              value={transferType}
              onValueChange={(v) => {
                setTransferType(v);
                setWalletAddress('');
                setShowPinInput(false);
                setTransactionPin('');
                setAmount('');
              }}
              className="mb-8"
            >
              <TabsList className="bg-slate-800 rounded-md p-1 grid grid-cols-2">
                <TabsTrigger value="external">External Transfer</TabsTrigger>
                <TabsTrigger value="internal">Internal Transfer</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 mb-8 backdrop-blur-sm">
              {/* Token */}
              <div className="mb-6">
                <label className="text-gray-300 text-sm flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-blue-500" /> Select Token
                </label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="text-white focus:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <Image src={token.imageLogo} alt={token.name} width={20} height={20} />
                          <span>{token.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Network */}
              <div className="mb-6">
                <label className="text-gray-300 text-sm flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-blue-500" /> Network
                </label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {currentToken.networks.map((network) => (
                      <SelectItem key={network.name} value={network.name} className="text-white focus:bg-slate-700">
                        <span>{network.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet */}
              <div className="mb-6">
                <label className="text-gray-300 text-sm flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  {transferType === 'external' ? 'Deposit Address' : 'Wallet ID'}
                </label>
                <Input
                  type="text"
                  placeholder={transferType === 'external' ? 'Auto-filled' : 'Enter Wallet ID'}
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className={`w-full bg-transparent border-b pb-2 outline-none text-white ${
                    missingWallet ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                  }`}
                  readOnly={transferType === 'external'}
                />
                {missingWallet && <p className="text-xs text-red-400 mt-2">Wallet ID is required</p>}
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="text-gray-300 text-sm flex items-center gap-2 mb-2">
                  <BanknoteArrowUp className="w-4 h-4 text-blue-500" /> Enter Amount
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 outline-none ${
                    invalidAmount ? 'text-red-400' : ''
                  }`}
                />
                {invalidAmount && <p className="text-xs text-red-400 mt-2">Enter a valid amount</p>}
              </div>

              {/* PIN */}
              {transferType === 'internal' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" /> Transaction PIN
                    </label>
                    <Button onClick={() => setShowPinInput(!showPinInput)} className="text-blue-500 text-xs">
                      {showPinInput ? <EyeOff className="w-4 h-4 text-blue-500" /> : <Eye className="w-4 h-4 text-blue-500" />}
                    </Button>
                  </div>
                  {showPinInput && (
                    <Input
                      type="password"
                      placeholder="••••"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value)}
                      className={`w-full bg-transparent border-b pb-2 outline-none text-white ${
                        missingPin ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                      }`}
                    />
                  )}
                  {missingPin && showPinInput && <p className="text-xs text-red-400 mt-2">Transaction PIN is required</p>}
                </div>
              )}
            </div>

            <Button
              disabled={disableContinue}
              className="w-full bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 text-white font-bold py-4 text-lg rounded-xl"
              onClick={handleContinue}
            >
              Continue Deposit
            </Button>
          </>
        )}

        {/* Step 2: Summary */}
        {step === 'summary' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 space-y-6">
            {transferType === 'external' && (
              <Image src={currentToken.qrCodeImg} alt={`${currentToken.symbol} QR Code`} width={220} height={220} className="mx-auto rounded-xl" />
            )}

            <div className="flex justify-between items-center">
              <span>Token:</span>
              <span className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${currentToken.color}`} />
                {currentToken.name} ({currentToken.symbol})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Network:</span>
              <span>{currentToken.networks.find((n) => n.name === selectedNetwork)?.name || selectedNetwork}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Amount:</span>
              <span>{amount}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>{transferType === 'external' ? 'Receiving Wallet' : 'Wallet ID'}:</span>
              <span className="flex items-center gap-2">
                {truncateAddress(walletAddress)}
                {transferType === 'external' && (
                  <Button onClick={() => copyToClipboard(walletAddress)}>
                    <Copy className="w-4 h-4 text-gray-500" />
                  </Button>
                )}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {remainingTime > 0
                ? `Time remaining to complete transaction: ${Math.floor(remainingTime / 60)}:${('0' + (remainingTime % 60)).slice(-2)}`
                : 'Transaction expired'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}