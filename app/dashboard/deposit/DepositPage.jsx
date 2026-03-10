// DepositPage.jsx

'use client';

'use client';

import { useState, useEffect } from 'react';
import { Copy, EyeOff, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';
import { truncateAddress } from '@/lib/utils';
import NavHeader from '../components/NavHeader/NavHeader';

const TIMER_DURATION_MS = 180_000; // 3 minutes

const tokens = [
  {
    symbol: 'USDT',
    name: 'Tether',
    imageLogo: '/tether-usdt-logo.png',
    qrCodeImg: '/eth-qrcode-img.png',
    networks: [
      { name: 'ERC20', imageLogo: '/tether-usdt-logo.png', receiveWalletAddress: '0x0688353c8f46299781e1a33ade320e25983d2402' },
      { name: 'TRC20', imageLogo: '/tron-trx-logo.png', receiveWalletAddress: 'TDKqRjF2shav3nZTqD3wwBMmtqUC81i88q' },
    ],
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    imageLogo: '/bitcoin-btc-logo.png',
    qrCodeImg: '/btc-qrcode-img.png',
    networks: [
      { name: 'Bitcoin', imageLogo: '/bitcoin-btc-logo.png', receiveWalletAddress: 'bc1qz4k4w6jq6mq0ku9t5cksjcf6upkjfy9f0s9k4n' },
    ],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    imageLogo: '/ethereum-eth-logo.png',
    qrCodeImg: '/eth-qrcode-img.png',
    networks: [
      { name: 'Ethereum', imageLogo: '/ethereum-eth-logo.png', receiveWalletAddress: '0x0688353c8f46299781e1a33ade320e25983d2402' },
      { name: 'Polygon', imageLogo: '/polygon-matic-logo.png', receiveWalletAddress: '0x0688353c8f46299781e1a33ade320e25983d2402' },
    ],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    imageLogo: '/solana-sol-logo.png',
    qrCodeImg: '/sol-qrcode-img.png',
    networks: [
      { name: 'Solana', imageLogo: '/sol-logo.png', receiveWalletAddress: '7xobDDbnnywZR6DY9UP1jS3QuvkFAGwVnUfugcGqjXVQ' },
    ],
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    imageLogo: '/dogecoin-doge-logo.png',
    qrCodeImg: '/doge-qrcode-img.png',
    networks: [
      { name: 'Dogecoin', imageLogo: '/dogecoin-doge-logo.png', receiveWalletAddress: 'DRhAMz5YH6uucEZWFuJrNznbrEf8yvD2R6' },
    ],
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    imageLogo: '/xrp-xrp-logo.png',
    qrCodeImg: '/xrp-qrcode-img.png',
    networks: [
      { name: 'Ripple', imageLogo: '/xrp-xrp-logo.png', receiveWalletAddress: 'r9neEq7H6THiHtA1dZAPCUtyzz79B3fmPw' },
    ],
  },
  {
    symbol: 'STELLAR',
    name: 'Stellar',
    imageLogo: '/stellar-xlm-logo.png',
    qrCodeImg: '/stellar-qrcode-img.png',
    networks: [
      { name: 'Stellar', imageLogo: '/stellar-xlm-logo.png', receiveWalletAddress: 'GD7W3OQDVBFU2QEYMOVNCSD42H5FE7W4KJB4YJCJD2D5N7C6APAM6VDM' },
    ],
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    imageLogo: '/bnb-bnb-logo.png',
    qrCodeImg: '/bnb-qrcode-img.png',
    networks: [
      { name: 'BSC (BEP20)', imageLogo: '/bnb-bnb-logo.png', receiveWalletAddress: '0x0688353c8f46299781e1a33ade320e25983d2402' },
    ],
  },
  {
    symbol: 'TON',
    name: 'Ton Coin',
    imageLogo: '/toncoin-ton-logo.png',
    qrCodeImg: '/ton-qrcode-img.png',
    networks: [
      { name: 'TON', imageLogo: '/toncoin-ton-logo.png', receiveWalletAddress: 'UQDTYf6CS_kMhP_fKnXsiDYJfHI0b3IcBQm_oinVXwwEEyA5' },
    ],
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    imageLogo: '/cardano-ada-logo.png',
    qrCodeImg: '/ada-qrcode-img.png',
    networks: [
      { name: 'Cardano', imageLogo: '/cardano-ada-logo.png', receiveWalletAddress: 'addr1q8kfx3x0sajryxaxadu6pnpgha4y7e3rg4lrrcd6nq8mvhe423dn5tzzycx2sy27nfw6zzdjzlcly3gmwe439jxjhhjst69j0v' },
    ],
  },
  {
    symbol: 'TRON',
    name: 'Tron',
    imageLogo: '/tron-trx-logo.png',
    qrCodeImg: '/tron-qrcode-img.png',
    networks: [
      { name: 'Tron', imageLogo: '/tron-trx-logo.png', receiveWalletAddress: 'TDKqRjF2shav3nZTqD3wwBMmtqUC81i88q' },
    ],
  },
];

export default function DepositPage() {
  const [transferType, setTransferType] = useState('external');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [walletID, setWalletID] = useState('');
  const [depositWalletAddress, setDepositWalletAddress] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [amount, setAmount] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [step, setStep] = useState('form');
  const [remainingTime, setRemainingTime] = useState(0);

  const currentToken = tokens.find(t => t.symbol === selectedToken) ?? tokens[0];
  const currentNetwork = currentToken.networks.find(n => n.name === selectedNetwork) ?? currentToken.networks[0];

  const minutes = String(Math.floor(remainingTime / 60)).padStart(2, '0');
  const seconds = String(remainingTime % 60).padStart(2, '0');

  // Reset network when token changes
  useEffect(() => {
    if (currentToken?.networks?.length) {
      setSelectedNetwork(currentToken.networks[0].name);
    }
  }, [selectedToken]);

  // Set/clear wallet address based on transfer type and network
  useEffect(() => {
    if (transferType === 'external') {
      setDepositWalletAddress(currentNetwork.receiveWalletAddress);
    } else {
      setDepositWalletAddress('');
    }
  }, [transferType, currentNetwork]);

  // Generate wallet ID for internal transfers
  useEffect(() => {
    if (transferType === 'internal') {
      const randomID = Math.floor(100000 + Math.random() * 900000);
      setWalletID(`ARR-${randomID}`);
    } else {
      setWalletID('');
    }
  }, [transferType]);

  // Restore session from cookies
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

  // Countdown timer
  useEffect(() => {
    if (step !== 'summary' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          Cookies.remove('DepositTransacToken');
          Cookies.remove('DepositTransacTokenExpires');
          setStep('form');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, remainingTime]);

  // Validation
  const amountNumber = Number(amount);
  const isAmountValid = !isNaN(amountNumber) && amountNumber > 0;
  const isWalletValid = transferType === 'external' || depositWalletAddress.trim().length > 0;
  const isWalletIDValid = transferType === 'external' || walletID.trim().length > 0;
  const isPinValid = transferType === 'external' || transactionPin.trim().length > 0;
  const canContinue = isAmountValid && isWalletValid && isWalletIDValid && isPinValid;

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
      const expiresAt = Date.now() + TIMER_DURATION_MS;
      Cookies.set('DepositTransacToken', token, { expires: 1 });
      Cookies.set('DepositTransacTokenExpires', expiresAt.toString(), { expires: 1 });
      setRemainingTime(TIMER_DURATION_MS / 1000);
    }
    setStep('summary');
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-7xl mx-auto py-10">

        <NavHeader />

        {/* ── FORM STEP ── */}
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

              {/* Token + Network selects */}
              <div className="flex gap-4 items-end justify-between mb-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Token</label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <Image src={token.imageLogo} width={18} height={18} alt={token.symbol} />
                            {token.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Network</label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentToken.networks.map(net => (
                        <SelectItem key={net.name} value={net.name}>
                          <div className="flex items-center gap-2">
                            <Image src={net.imageLogo} width={18} height={18} alt={net.name} />
                            {net.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Wallet address */}
              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-1">
                  {transferType === 'internal' ? 'Receiver Wallet Address' : 'Deposit Wallet Address'}
                </label>
                <div className="relative flex items-center gap-2">
                  <Input
                    value={transferType === 'external' ? currentNetwork.receiveWalletAddress : depositWalletAddress}
                    readOnly={transferType === 'external'}
                    onChange={e => setDepositWalletAddress(e.target.value)}
                    placeholder={transferType === 'internal' ? 'Enter receiver wallet address' : ''}
                    className="w-full bg-zinc-800 border-zinc-700 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() =>
                      copyToClipboard(
                        transferType === 'external' ? currentNetwork.receiveWalletAddress : depositWalletAddress
                      )
                    }
                    title="Copy address"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <Input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter deposit amount"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              {/* External: QR code */}
              {transferType === 'external' && (
                <div className="mt-6 text-center">
                  <Image
                    src={currentToken.qrCodeImg}
                    width={200}
                    height={200}
                    alt={`${currentToken.symbol} QR code`}
                    className="mx-auto rounded-md p-4 bg-white"
                  />
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <span className="text-sm font-mono">
                      {truncateAddress(currentNetwork.receiveWalletAddress)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(currentNetwork.receiveWalletAddress)}
                      title="Copy address"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Internal: wallet ID + PIN */}
              {transferType === 'internal' && (
                <>
                  <div className="mt-6">
                    <label className="block text-sm text-gray-400 mb-1">Receiver Wallet ID</label>
                    <Input
                      value={walletID}
                      onChange={e => setWalletID(e.target.value)}
                      placeholder="Enter receiver wallet ID"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-1">Transaction PIN</label>
                    <div className="flex gap-2">
                      <Input
                        type={showPinInput ? 'text' : 'password'}
                        value={transactionPin}
                        onChange={e => setTransactionPin(e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="Enter PIN"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPinInput(v => !v)}
                        title={showPinInput ? 'Hide PIN' : 'Show PIN'}
                      >
                        {showPinInput ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full mt-6 bg-green-500 hover:bg-green-400 text-black font-semibold"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* ── SUMMARY STEP ── */}
        {step === 'summary' && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4">


            <p className="text-sm text-green-400 border border-green-700 rounded-md p-3">
              Make sure to send the exact amount to the correct wallet address to avoid any issues.
            </p>

            {/* QR Code */}
            <div className="w-fit mx-auto rounded-lg p-4 bg-white">
              <Image
                src={currentToken.qrCodeImg}
                width={200}
                height={200}
                alt={`${currentToken.symbol} QR code`}
                className="mx-auto"
              />
            </div>
            <p className="text-sm text-gray-400">
              Kindly complete the transaction within the specified time limit.
            </p>

            {/* Summary rows */}
            {[
              { label: 'Token', value: currentToken.symbol },
              { label: 'Amount', value: amount },
              { label: 'Network', value: selectedNetwork },
              {
                label: transferType === 'internal' ? 'Wallet ID' : 'Wallet',
                value: transferType === 'internal'
                  ? walletID
                  : truncateAddress(currentNetwork.receiveWalletAddress),
              },
              ...(transferType === 'internal'
                ? [{ label: 'Deposit Wallet', value: truncateAddress(depositWalletAddress) }]
                : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-zinc-800 pb-2 last:border-0">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}


            {/* Timer — shown only for external transfers */}
            {transferType === 'external' && (
              <p className={`text-sm font-mono text-center ${remainingTime <= 30 ? 'text-red-400' : 'text-gray-400'}`}>
                Time remaining: {minutes}:{seconds}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}