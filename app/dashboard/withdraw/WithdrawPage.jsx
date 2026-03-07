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
import getUserAssets from "@/controllers/getUserAssets";

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
        { name: "TRC20", imageLogo: "/tron-trx-logo.png" },
      ],
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      imageLogo: "/bitcoin-btc-logo.png",
      networks: [
        { name: "Bitcoin", imageLogo: "/bitcoin-btc-logo.png" },
      ],
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
    {
      symbol: "SOL",
      name: "Solana",
      imageLogo: "/solana-sol-logo.png",
      networks: [
        { name: "Solana", imageLogo: "/sol-logo.png" },
      ],
    },
    {
      symbol: "DOGE",
      name: "Dogecoin",
      imageLogo: "/dogecoin-doge-logo.png",
      networks: [
        { name: "Dogecoin", imageLogo: "/dogecoin-doge-logo.png" },
      ],
    },
    {
      symbol: "XRP",
      name: "XRP",
      imageLogo: "/xrp-xrp-logo.png",
      networks: [
        { name: "Ripple", imageLogo: "/xrp-xrp-logo.png" },
      ],
    },
    {
      symbol: "STELLAR",
      name: "Stellar",
      imageLogo: "/stellar-xlm-logo.png",
      networks: [
        { name: "Stellar", imageLogo: "/stellar-xlm-logo.png" },
      ],
    },
    {
      symbol: "TON",
      name: "Ton Coin",
      imageLogo: "/ton-ton-logo.png",
      networks: [
        { name: "TON", imageLogo: "/ton-ton-logo.png" },
      ],
    },
    {
      symbol: "ADA",
      name: "Cardano",
      imageLogo: "/cardano-ada-logo.png",
      networks: [
        { name: "Cardano", imageLogo: "/cardano-ada-logo.png" },
      ],
    },
    {
      symbol: "BNB",
      name: "Binance Coin",
      imageLogo: "/bnb-bnb-logo.png",
      networks: [
        { name: "BSC (BEP20)", imageLogo: "/bnb-bnb-logo.png" },
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
  const [userAssetsData, setUserAssetsData] = useState(null);
  const [loadingAssets, setLoadingAssets] = useState(true);

  /* ----------------------------------
     Fetch User Assets
  ---------------------------------- */

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getUserAssets();
        setUserAssetsData(data);
      } catch (error) {
        console.error("Error fetching user assets:", error);
        setUserAssetsData({ totalUsd: 0, assets: [] });
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

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
      <Card className="w-full max-w-3xl p-6 space-y-6 mb-12">

        <div className="">

          <button
            onClick={() => router.push("/dashboard")}
            className="bg-none block text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>

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
                  const userAsset = userAssetsData?.assets.find(
                    (a) => a.coin.toUpperCase() === t.symbol
                  );

                  return (
                    <SelectItem key={t.symbol} value={t.symbol}>
                      {t.symbol} - {t.name}
                      {userAsset && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Balance: {userAsset.amount.toFixed(4)}
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
                userAssetsData={userAssetsData}
                onConfirm={handleConfirm}
              />
            ) : (
              <InternalWithdrawal
                selectedAsset={selectedAsset}
                selectedNetwork={selectedNetwork}
                userAssetsData={userAssetsData}
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