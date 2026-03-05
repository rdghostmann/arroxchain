'use client';

import { useState, useEffect } from 'react';
import { Wallet, Shield, Copy, Coins, EyeOff, Eye } from 'lucide-react';
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

  // TOKENS
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

  // STATE
  const [transferType, setTransferType] = useState('external');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [amount, setAmount] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [step, setStep] = useState('form');
  const [remainingTime, setRemainingTime] = useState(0);

  const currentToken = tokens.find(t => t.symbol === selectedToken) || tokens[0];

  // DEFAULT NETWORK
  useEffect(() => {
    if (currentToken?.networks?.length) {
      setSelectedNetwork(currentToken.networks[0].name);
    }
  }, [selectedToken]);

  // AUTO WALLET ADDRESS
  useEffect(() => {
    if (transferType === 'external') {
      setWalletAddress(currentToken.receiveWalletAddress);
    } else {
      setWalletAddress('');
    }
  }, [transferType, currentToken]);

  // RESTORE COOKIE SESSION
  useEffect(() => {
    const token = Cookies.get('DepositTransacToken');
    const expires = Cookies.get('DepositTransacTokenExpires');

    if (!token || !expires) return;

    const timeLeft = Math.max(Number(expires) - Date.now(), 0);

    if (timeLeft > 0) {
      setStep('summary');
      setRemainingTime(Math.floor(timeLeft / 1000));
    }
  }, []);

  // COUNTDOWN
  useEffect(() => {
    if (step === 'summary' && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(t => {
          if (t <= 1) {
            Cookies.remove('DepositTransacToken');
            Cookies.remove('DepositTransacTokenExpires');
            setStep('form');
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, remainingTime]);

  // VALIDATION
  const amountNumber = Number(amount);
  const invalidAmount = amountNumber <= 0 || isNaN(amountNumber);

  const missingWallet =
    transferType === 'internal' && walletAddress.trim().length === 0;

  const invalidWalletFormat =
    transferType === 'internal' &&
    walletAddress.length > 0 &&
    !walletAddress.startsWith('ARR-');

  const missingPin =
    transferType === 'internal' && transactionPin.trim().length === 0;

  const disableContinue =
    invalidAmount ||
    missingWallet ||
    invalidWalletFormat ||
    missingPin;

  // COPY
  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleContinue = () => {
    if (transferType === 'external') {
      const token = Math.random().toString(36).substring(2);
      const expiresAt = Date.now() + 90000;

      Cookies.set('DepositTransacToken', token, { expires: 1 });
      Cookies.set('DepositTransacTokenExpires', expiresAt.toString(), { expires: 1 });
    }

    setStep('summary');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <NavHeader />

        {step === 'form' && (
          <>

            <Tabs value={transferType} onValueChange={setTransferType} className="mb-6">
              <TabsList className="grid grid-cols-2 bg-slate-800">
                <TabsTrigger value="external">External</TabsTrigger>
                <TabsTrigger value="internal">Internal</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">

              <h1 className="text-xl font-semibold mb-6">Deposit</h1>

              {/* TOKEN */}
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {tokens.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <Image src={token.imageLogo} width={18} height={18} alt="" />
                        {token.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* AMOUNT */}
              <div className="mt-6">
                <label className="text-sm text-gray-400">Amount</label>

                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 bg-zinc-800 border-zinc-700"
                />
              </div>

              {/* EXTERNAL */}
              {transferType === 'external' && (
                <div className="mt-6 text-center">

                  <Image
                    src={currentToken.qrCodeImg}
                    alt="QR"
                    width={200}
                    height={200}
                    className="mx-auto rounded-md p-4 bg-white"
                  />

                  <div className="flex justify-center items-center gap-2 mt-4">
                    <span className="text-sm">
                      {truncateAddress(currentToken.receiveWalletAddress)}
                    </span>

                    <button onClick={() => copyToClipboard(currentToken.receiveWalletAddress)}>
                      <Copy size={16} />
                    </button>
                  </div>

                </div>
              )}

              {/* INTERNAL */}
              {transferType === 'internal' && (
                <>
                  <div className="mt-6">
                    <label className="text-sm text-gray-400">Wallet ID</label>

                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="ARR-123456"
                      className="mt-2 bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm text-gray-400">Transaction PIN</label>

                    <div className="flex gap-2">
                      <Input
                        type={showPinInput ? 'text' : 'password'}
                        value={transactionPin}
                        onChange={(e) => setTransactionPin(e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                      />

                      <Button
                        type="button"
                        onClick={() => setShowPinInput(!showPinInput)}
                      >
                        {showPinInput ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleContinue}
                disabled={disableContinue}
                className="w-full mt-6 bg-green-500 text-black"
              >
                Continue
              </Button>

            </div>
          </>
        )}

        {/* SUMMARY */}
        {step === 'summary' && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4">

            <Image
              src={currentToken.qrCodeImg}
              width={200}
              height={200}
              alt="QR"
              className="mx-auto"
            />

            <div className="flex justify-between">
              <span>Token</span>
              <span>{currentToken.symbol}</span>
            </div>

            <div className="flex justify-between">
              <span>Amount</span>
              <span>{amount}</span>
            </div>

            <div className="flex justify-between">
              <span>Network</span>
              <span>{selectedNetwork}</span>
            </div>

            <div className="flex justify-between">
              <span>Wallet</span>
              <span>{truncateAddress(walletAddress)}</span>
            </div>

            <p className="text-xs text-gray-400">
              {remainingTime > 0
                ? `Time remaining: ${Math.floor(remainingTime / 60)}:${('0' + (remainingTime % 60)).slice(-2)}`
                : 'Transaction expired'}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}