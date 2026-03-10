// DepositPage.jsx

'use client';

import { useState, useEffect } from 'react';
import { Copy, EyeOff, Eye } from 'lucide-react';
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
      color: 'from-orange-500 to-amber-500',
      qrCodeImg: '/btc-qrcode-img.png',
      networks: [
        { name: 'Bitcoin', imageLogo: '/bitcoin-btc-logo.png', receiveWalletAddress: 'bc1qz4k4w6jq6mq0ku9t5cksjcf6upkjfy9f0s9k4n' },
      ],
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      imageLogo: '/ethereum-eth-logo.png',
      color: 'from-purple-500 to-pink-500',
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
      color: 'from-purple-500 to-pink-500',
      qrCodeImg: '/sol-qrcode-img.png',
      networks: [
        { name: 'Solana', imageLogo: '/sol-logo.png', receiveWalletAddress: '7xobDDbnnywZR6DY9UP1jS3QuvkFAGwVnUfugcGqjXVQ' },
      ],
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      imageLogo: '/dogecoin-doge-logo.png',
      color: 'from-yellow-500 to-orange-400',
      qrCodeImg: '/doge-qrcode-img.png',
      networks: [
        { name: 'Dogecoin', imageLogo: '/dogecoin-doge-logo.png', receiveWalletAddress: 'DRhAMz5YH6uucEZWFuJrNznbrEf8yvD2R6' },
      ],
    },
    {
      symbol: 'XRP',
      name: 'XRP',
      imageLogo: '/xrp-xrp-logo.png',
      color: 'from-blue-500 to-cyan-500',
      qrCodeImg: '/xrp-qrcode-img.png',
      networks: [
        { name: 'Ripple', imageLogo: '/xrp-xrp-logo.png', receiveWalletAddress: 'r9neEq7H6THiHtA1dZAPCUtyzz79B3fmPw' },
      ],
    },
    {
      symbol: 'STELLAR',
      name: 'Stellar',
      imageLogo: '/stellar-xlm-logo.png',
      color: 'from-indigo-500 to-purple-500',
      qrCodeImg: '/stellar-qrcode-img.png',
      networks: [
        { name: 'Stellar', imageLogo: '/stellar-xlm-logo.png', receiveWalletAddress: 'GD7W3OQDVBFU2QEYMOVNCSD42H5FE7W4KJB4YJCJD2D5N7C6APAM6VDM' },
      ],
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      imageLogo: '/bnb-bnb-logo.png',
      color: 'from-yellow-400 to-yellow-500',
      qrCodeImg: '/bnb-qrcode-img.png',
      networks: [
        { name: 'BSC (BEP20)', imageLogo: '/bnb-bnb-logo.png', receiveWalletAddress: '0x0688353c8f46299781e1a33ade320e25983d2402' },
      ],
    },
    {
      symbol: 'TON',
      name: 'Ton Coin',
      imageLogo: '/toncoin-ton-logo.png',
      color: 'from-blue-400 to-blue-600',
      qrCodeImg: '/ton-qrcode-img.png',
      networks: [
        { name: 'TON', imageLogo: '/toncoin-ton-logo.png', receiveWalletAddress: 'UQDTYf6CS_kMhP_fKnXsiDYJfHI0b3IcBQm_oinVXwwEEyA5' },
      ],
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      imageLogo: '/cardano-ada-logo.png',
      color: 'from-red-500 to-pink-500',
      qrCodeImg: '/ada-qrcode-img.png',
      networks: [
        { name: 'Cardano', imageLogo: '/cardano-ada-logo.png', receiveWalletAddress: 'addr1q8kfx3x0sajryxaxadu6pnpgha4y7e3rg4lrrcd6nq8mvhe423dn5tzzycx2sy27nfw6zzdjzlcly3gmwe439jxjhhjst69j0v' },
      ],
    },
    {
      symbol: 'TRON',
      name: 'Tron',
      imageLogo: '/tron-trx-logo.png',
      color: 'from-red-500 to-orange-500',
      qrCodeImg: '/tron-qrcode-img.png',
      networks: [
        { name: 'Tron', imageLogo: '/tron-trx-logo.png', receiveWalletAddress: 'TDKqRjF2shav3nZTqD3wwBMmtqUC81i88q' },
      ],
    },
  ];

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

  const currentToken =
    tokens.find(t => t.symbol === selectedToken) || tokens[0];

  const currentNetwork =
    currentToken.networks.find(n => n.name === selectedNetwork) ||
    currentToken.networks[0];


  // DEFAULT NETWORK
  useEffect(() => {
    if (currentToken?.networks?.length) {
      setSelectedNetwork(currentToken.networks[0].name)
    }
  }, [currentToken])


  // AUTO WALLET ADDRESS FOR EXTERNAL
  useEffect(() => {
    if (transferType === 'external') {
      setDepositWalletAddress(currentNetwork.receiveWalletAddress)
    } else {
      setDepositWalletAddress('')
    }
  }, [transferType, currentNetwork])


  // GENERATE WALLET ID
  useEffect(() => {
    if (transferType === 'internal') {
      const randomID = Math.floor(100000 + Math.random() * 900000)
      setWalletID(`ARR-${randomID}`)
    } else {
      setWalletID('')
    }
  }, [transferType])


  // RESTORE COOKIE SESSION
  useEffect(() => {
    const token = Cookies.get('DepositTransacToken')
    const expires = Cookies.get('DepositTransacTokenExpires')

    if (!token || !expires) return

    const timeLeft = Math.max(Number(expires) - Date.now(), 0)

    if (timeLeft > 0) {
      setStep('summary')
      setRemainingTime(Math.floor(timeLeft / 1000))
    }
  }, [])


  // COUNTDOWN
  useEffect(() => {
    if (step === 'summary' && remainingTime > 0) {

      const timer = setInterval(() => {

        setRemainingTime(t => {

          if (t <= 1) {
            Cookies.remove('DepositTransacToken')
            Cookies.remove('DepositTransacTokenExpires')
            setStep('form')
            return 0
          }

          return t - 1
        })

      }, 1000)

      return () => clearInterval(timer)

    }

  }, [step, remainingTime])

  // VALIDATION
  const amountNumber = Number(amount)

  const invalidAmount =
    transferType === "internal" &&
    (amountNumber <= 0 || isNaN(amountNumber))

  const missingWallet =
    depositWalletAddress.trim().length === 0

  const invalidWalletID =
    transferType === 'internal' && !walletID.startsWith('ARR-')

  const missingPin =
    transferType === 'internal' && transactionPin.trim().length === 0

  const disableContinue =
    invalidAmount ||
    missingWallet ||
    invalidWalletID ||
    missingPin


  // COPY
  const copyToClipboard = async (value) => {

    try {

      await navigator.clipboard.writeText(value)
      toast.success('Copied!')

    } catch {

      toast.error('Copy failed')

    }

  }


  // CONTINUE
  const handleContinue = () => {

    if (transferType === 'external') {

      const token = Math.random().toString(36).substring(2)
      const expiresAt = Date.now() + 90000

      Cookies.set('DepositTransacToken', token, { expires: 1 })
      Cookies.set('DepositTransacTokenExpires', expiresAt.toString(), { expires: 1 })

    }

    setStep('summary')

  }


  return (

    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="w-full max-w-7xl mx-auto py-10">

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


              <div className="flex gap-4 items-center justify-between mb-4">
                {/* TOKEN */}

                <span className="block">
                  <label className="text-sm text-gray-400">Token</label>
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
                </span>


                {/* NETWORK */}

                <span className="block">

                  <label className="text-sm text-gray-400">Network</label>

                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>

                    <SelectTrigger className="bg-zinc-800 border-zinc-700">

                      <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                      {currentToken.networks.map(net => (

                        <SelectItem key={net.name} value={net.name}>

                          <div className="flex items-center gap-2">

                            <Image src={net.imageLogo} width={18} height={18} alt="" />

                            {net.name}

                          </div>

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>
                </span>
              </div>



              {/* WALLET */}

              {/* WALLET ADDRESS */}

              <div className="mt-6">
                <label className="text-sm text-gray-400">
                  {transferType === "internal" ? "Receiver Wallet Address" : "Deposit Wallet Address"}
                </label>

                <div className="relative">

                  <Input
                    value={
                      transferType === "external"
                        ? currentNetwork.receiveWalletAddress
                        : depositWalletAddress
                    }
                    readOnly={transferType === "external"}
                    onChange={(e) => setDepositWalletAddress(e.target.value)}
                    placeholder={
                      transferType === "internal"
                        ? "Enter receiver wallet address"
                        : ""
                    }
                    className="w-full bg-zinc-800 border-zinc-700"
                  />

                  <Copy
                    className="absolute right-3 top-3 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(
                        transferType === "external"
                          ? currentNetwork.receiveWalletAddress
                          : depositWalletAddress
                      )
                    }
                  />

                </div>
              </div>


              {/* AMOUNT */}

              {transferType === "internal" && (

                <div className="mt-6">
                  <label className="text-sm text-gray-400">Amount</label>

                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2 bg-zinc-800 border-zinc-700"
                  />

                </div>

              )}



              {/* EXTERNAL QRCODE */}

              {transferType === 'external' && (

                <div className="mt-6 text-center">

                  <Image
                    src={currentToken.qrCodeImg}
                    width={200}
                    height={200}
                    alt="QR"
                    className="mx-auto rounded-md p-4 bg-white"
                  />

                  <div className="flex justify-center items-center gap-2 mt-4">

                    <span className="text-sm">
                      {truncateAddress(currentNetwork.receiveWalletAddress)}
                    </span>

                    <Button
                      onClick={() => copyToClipboard(currentNetwork.receiveWalletAddress)}
                    >

                      <Copy size={16} />

                    </Button>

                  </div>

                </div>

              )}



              {/* INTERNAL QRCODE */}

              {transferType === 'internal' && (

                <>

                  <div className="mt-6">

                    <label className="text-sm text-gray-400">Wallet ID</label>

                    <Input
                      value={walletID}
                      readOnly
                      className="mt-2 bg-zinc-800 border-zinc-700"
                    />

                  </div>

                  <div className="mt-4">

                    <label className="text-sm text-gray-400">
                      Transaction PIN
                    </label>

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



        {step === 'summary' && (

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-4">

            <Image
              src={currentToken.qrCodeImg}
              width={200}
              height={200}
              alt="QR"
              className="mx-auto border-rounded-lg p-4 bg-white"
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

              <span>
                {transferType === 'internal' ? 'Wallet ID' : 'Wallet'}
              </span>

              <span>
                {transferType === 'internal'
                  ? walletID
                  : truncateAddress(currentNetwork.receiveWalletAddress)}
              </span>

            </div>

            {transferType === 'internal' && (

              <div className="flex justify-between">

                <span>Deposit Wallet</span>

                <span>{truncateAddress(depositWalletAddress)}</span>

              </div>

            )}

            <p className="text-xs text-gray-400">

              {remainingTime > 0
                ? `Time remaining: ${Math.floor(remainingTime / 60)}:${('0' + (remainingTime % 60)).slice(-2)}`
                : 'Transaction Initiated'}

            </p>

          </div>

        )}

      </div>

    </div>

  )

}