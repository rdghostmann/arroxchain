// WithdrawPage.jsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Shadcn Select
import { ExternalWithdrawal, InternalWithdrawal } from "./Withdrawals";

export default function WithdrawPage() {
  // -----------------------------------
  // State
  // -----------------------------------
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [withdrawType, setWithdrawType] = useState("external");

  // -----------------------------------
  // Tokens Data
  // -----------------------------------
  const tokens = [
    {
      symbol: "USDT",
      name: "Tether",
      imageLogo: "/tether-usdt-logo.png",
      color: "from-green-500 to-blue-500",
      receiveWalletAddress: "0x60B89377D92cA54D86f0319D160e4171E4761A9b",
      qrCodeImg: "/eth-qrcode-img.png",
      networks: [
        { name: "ERC20", imageLogo: "/tether-usdt-logo.png" },
        { name: "Tron", imageLogo: "/tron-trx-logo.png" },
      ],
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      imageLogo: "/bitcoin-btc-logo.png",
      color: "from-orange-500 to-amber-500",
      receiveWalletAddress: "bc1qz4k4w6jq6mq0ku9t5cksjcf6upkjfy9f0s9k4n",
      qrCodeImg: "/btc-qrcode-img.png",
      networks: [{ name: "Bitcoin", imageLogo: "/bitcoin-btc-logo.png" }],
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      imageLogo: "/ethereum-eth-logo.png",
      color: "from-purple-500 to-pink-500",
      receiveWalletAddress: "0x0688353c8f46299781e1a33ade320e25983d2402",
      qrCodeImg: "/eth-qrcode-img.png",
      networks: [
        { name: "Ethereum", imageLogo: "/ethereum-eth-logo.png" },
        { name: "Polygon", imageLogo: "/polygon-matic-logo.png" },
      ],
    },
  ];

  // -----------------------------------
  // Handlers
  // -----------------------------------
  const handleExternalConfirm = (data) => console.log("External Withdrawal:", data);
  const handleInternalConfirm = (data) => console.log("Internal Transfer:", data);

  // Update network when token changes
  useEffect(() => {
    if (selectedToken) {
      setSelectedNetwork(selectedToken.networks[0]);
    } else {
      setSelectedNetwork(null);
    }
  }, [selectedToken]);

  return (
    <div className="min-h-screen flex justify-center items-start p-6">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <h2 className="text-2xl font-bold">Withdraw Assets</h2>

        {/* -------------------------------
            Token Selector
        ------------------------------- */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Token</label>
          <Select
            value={selectedToken?.symbol || ""}
            onValueChange={(value) =>
              setSelectedToken(tokens.find((t) => t.symbol === value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Token" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((t) => (
                <SelectItem key={t.symbol} value={t.symbol}>
                  {t.symbol} - {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* -------------------------------
            Network Selector
        ------------------------------- */}
        {selectedToken && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Network</label>
            <Select
              value={selectedNetwork?.name || ""}
              onValueChange={(value) =>
                setSelectedNetwork(
                  selectedToken.networks.find((n) => n.name === value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                {selectedToken.networks.map((n) => (
                  <SelectItem key={n.name} value={n.name}>
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* -------------------------------
            Withdraw Type Selector
        ------------------------------- */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Withdraw Type</label>
          <Select value={withdrawType} onValueChange={setWithdrawType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Withdraw Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* -------------------------------
            Withdrawals Component
        ------------------------------- */}
        {selectedToken && selectedNetwork && (
          <div className="mt-4">
            {withdrawType === "external" ? (
              <ExternalWithdrawal
                selectedAsset={{ symbol: selectedToken.symbol }}
                onConfirm={handleExternalConfirm}
              />
            ) : (
              <InternalWithdrawal
                selectedAsset={{ symbol: selectedToken.symbol }}
                onConfirm={handleInternalConfirm}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}