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
} from "@/components/ui/select";
import { ExternalWithdrawal, InternalWithdrawal } from "./Withdrawals";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  const router = useRouter();

  /* ----------------------------------
     Tokens Data
  ---------------------------------- */

  const tokens = [
    {
      symbol: "USDT",
      name: "Tether",
      imageLogo: "/tether-usdt-logo.png",
      networks: [
        { name: "ERC20", imageLogo: "/tether-usdt-logo.png" },
        { name: "Tron", imageLogo: "/tron-trx-logo.png" },
      ],
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      imageLogo: "/bitcoin-btc-logo.png",
      networks: [{ name: "Bitcoin", imageLogo: "/bitcoin-btc-logo.png" }],
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      imageLogo: "/ethereum-eth-logo.png",
      networks: [
        { name: "Ethereum", imageLogo: "/ethereum-eth-logo.png" },
        { name: "Polygon", imageLogo: "/polygon-matic-logo.png" },
      ],
    },
  ];

  /* ----------------------------------
     Default BTC selection
  ---------------------------------- */

  const defaultBTC = tokens.find((t) => t.symbol === "BTC");

  /* ----------------------------------
     State
  ---------------------------------- */

  const [selectedAsset, setSelectedAsset] = useState(defaultBTC);
  const [selectedNetwork, setSelectedNetwork] = useState(defaultBTC.networks[0]);
  const [withdrawType, setWithdrawType] = useState("external");

  /* ----------------------------------
     Mock User Wallet Assets
  ---------------------------------- */

  const mockUserAssets = [
    { symbol: "BTC", balance: 1.248 },
    { symbol: "USDT", balance: 2540000 },
    { symbol: "ETH", balance: 12.65 },
  ];

  /* ----------------------------------
     Update network when asset changes
  ---------------------------------- */

  useEffect(() => {
    if (selectedAsset) {
      setSelectedNetwork(selectedAsset.networks[0] || null);
    }
  }, [selectedAsset]);

  /* ----------------------------------
     Confirm Handler
  ---------------------------------- */

  const handleConfirm = async (data) => {
    console.log("Withdraw request:", data);
  };

  /* ----------------------------------
     Render
  ---------------------------------- */

  return (
    <div className="min-h-screen flex justify-center items-start p-6">
      <Card className="w-full max-w-3xl p-6 space-y-6">

        <div className="flex flex-col items-center justify-between">

          <Button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </Button>

          <h2 className="text-2xl font-bold">Withdraw Assets</h2>

        </div>
        <div className="flex flex-wrap gap-4">

          {/* TOKEN SELECT */}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Token</Label>

            <Select
              value={selectedAsset?.symbol}
              onValueChange={(symbol) => {
                const asset = tokens.find((t) => t.symbol === symbol);
                setSelectedAsset(asset);
              }}
            >
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>

              <SelectContent>
                {tokens.map((t) => {
                  const userAsset = mockUserAssets.find(
                    (a) => a.symbol === t.symbol
                  );

                  return (
                    <SelectItem key={t.symbol} value={t.symbol}>
                      {t.symbol} - {t.name}
                      {userAsset && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Balance: {userAsset.balance}
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* NETWORK SELECT */}

          {selectedAsset && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Network</Label>

              <Select
                value={selectedNetwork?.name}
                onValueChange={(networkName) => {
                  const network = selectedAsset.networks.find(
                    (n) => n.name === networkName
                  );
                  setSelectedNetwork(network);
                }}
              >
                <SelectTrigger className="w-50">
                  <SelectValue placeholder="Select Network" />
                </SelectTrigger>

                <SelectContent>
                  {selectedAsset.networks.map((n) => (
                    <SelectItem key={n.name} value={n.name}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* WITHDRAW TYPE */}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Withdraw Type</Label>

            <Select value={withdrawType} onValueChange={setWithdrawType}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Withdraw Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* WITHDRAW COMPONENT */}

        {selectedAsset && selectedNetwork ? (
          <div className="mt-4">

            {withdrawType === "external" ? (
              <ExternalWithdrawal
                selectedAsset={selectedAsset}
                selectedNetwork={selectedNetwork}
                onConfirm={handleConfirm}
              />
            ) : (
              <InternalWithdrawal
                selectedAsset={selectedAsset}
                selectedNetwork={selectedNetwork}
                onConfirm={handleConfirm}
              />
            )}

          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a token and network first
          </p>
        )}

      </Card>
    </div>
  );
}