"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Wallet, TrendingUp, Users, Search } from "lucide-react";
import AdminTopNav from "../_components/AdminTopNav";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
// import { getWalletUsers, updateUserAssets } from "./actions";

// ── Static config ──────────────────────────────────────────────────────────
const ASSETS = {
  BTC:  { name: "Bitcoin",       symbol: "BTC",  color: "bg-orange-500" },
  ETH:  { name: "Ethereum",      symbol: "ETH",  color: "bg-blue-500"   },
  USDT: { name: "Tether",        symbol: "USDT", color: "bg-green-500"  },
  BNB:  { name: "Binance Coin",  symbol: "BNB",  color: "bg-yellow-500" },
  SOL:  { name: "Solana",        symbol: "SOL",  color: "bg-purple-500" },
  ADA:  { name: "Cardano",       symbol: "ADA",  color: "bg-blue-600"   },
  XRP:  { name: "Ripple",        symbol: "XRP",  color: "bg-gray-500"   },
  DOGE: { name: "Dogecoin",      symbol: "DOGE", color: "bg-yellow-600" },
  TRX:  { name: "Tron",          symbol: "TRX",  color: "bg-red-500"    },
  DOT:  { name: "Polkadot",      symbol: "DOT",  color: "bg-pink-500"   },
  SHIB: { name: "Shiba Inu",     symbol: "SHIB", color: "bg-orange-600" },
  XLM:  { name: "Stellar",       symbol: "XLM",  color: "bg-blue-400"   },
};

const COIN_NETWORKS = {
  BTC:  ["Mainnet"],
  ETH:  ["Mainnet"],
  USDT: ["ERC20", "TRC20", "BEP20"],
  BNB:  ["BNB Smart Chain (BEP20)"],
  SOL:  ["Solana"],
  ADA:  ["Cardano"],
  XRP:  ["Ripple"],
  DOGE: ["Dogecoin"],
  TRX:  ["Tron"],
  DOT:  ["Polkadot"],
  SHIB: ["Ethereum"],
  XLM:  ["Stellar"],
};
// ──────────────────────────────────────────────────────────────────────────

export default function WalletPage({ initialUsers }) {
  const [users, setUsers]               = useState(initialUsers ?? []);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingAssets, setEditingAssets] = useState([]);
  const [newAssetCoin, setNewAssetCoin]   = useState("");
  const [newAssetNetwork, setNewAssetNetwork] = useState("");
  const [livePrices, setLivePrices]     = useState({});
  const [isPending, startTransition]    = useTransition(); 

// ── Refresh users ──────────────────────────────────────────────────────────
const refreshUsers = () => {
  startTransition(async () => {
    try {
      const res = await fetch("/api/admin/get-wallet-users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
      else toast.error("Failed to refresh: " + data.error);
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  });
};

// ── Save assets ────────────────────────────────────────────────────────────
const handleSaveAssets = () => {
  if (!selectedUser) return;

  startTransition(async () => {
    try {
      const res = await fetch("/api/admin/update-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, assets: editingAssets }),
      });

      const result = await res.json();

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === result.user.id ? result.user : u))
        );
        setSelectedUser(null);
        setEditingAssets([]);
        toast.success("Assets updated successfully");
      } else {
        toast.error("Failed to update: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  });
};
  // ── Live prices from CoinGecko ─────────────────────────────────────────
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,cardano,ripple,dogecoin,tron,polkadot,shiba-inu,stellar&vs_currencies=usd"
        );
        const data = await res.json();
        setLivePrices({
          BTC:  data.bitcoin?.usd        ?? 0,
          ETH:  data.ethereum?.usd       ?? 0,
          USDT: data.tether?.usd         ?? 0,
          BNB:  data.binancecoin?.usd    ?? 0,
          SOL:  data.solana?.usd         ?? 0,
          ADA:  data.cardano?.usd        ?? 0,
          XRP:  data.ripple?.usd         ?? 0,
          DOGE: data.dogecoin?.usd       ?? 0,
          TRX:  data.tron?.usd           ?? 0,
          DOT:  data.polkadot?.usd       ?? 0,
          SHIB: data["shiba-inu"]?.usd   ?? 0,
          XLM:  data.stellar?.usd        ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch live prices:", err);
      }
    }
    fetchPrices();
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────
  const calculateTotalValue = (assets) => {
    if (!Array.isArray(assets)) return 0;
    return assets.reduce((total, asset) => {
      return total + (asset.amount || 0) * (livePrices[asset.coin] || 0);
    }, 0);
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const q = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || "").includes(q) ||
        (u.email?.toLowerCase() || "").includes(q)
    );
  }, [users, searchTerm]);

  const totalUsers  = filteredUsers.length;
  const totalValue  = filteredUsers.reduce((s, u) => s + calculateTotalValue(u.assets), 0);
  const totalAssets = filteredUsers.reduce((s, u) => s + (u.assets?.length ?? 0), 0);

  // ── Edit dialog handlers ───────────────────────────────────────────────
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditingAssets(Array.isArray(user.assets) ? user.assets : []);
    setNewAssetCoin("");
    setNewAssetNetwork("");
  };

  const updateAssetAmount = (index, value) =>
    setEditingAssets((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, amount: Math.max(0, parseFloat(value) || 0) } : a
      )
    );

  const updateAssetNetwork = (index, network) =>
    setEditingAssets((prev) =>
      prev.map((a, i) => (i === index ? { ...a, network } : a))
    );

  const addNewAsset = () => {
    if (
      !newAssetCoin ||
      !newAssetNetwork ||
      editingAssets.some(
        (a) => a.coin === newAssetCoin && a.network === newAssetNetwork
      )
    )
      return;
    setEditingAssets((prev) => [
      ...prev,
      { coin: newAssetCoin, network: newAssetNetwork, amount: 0 },
    ]);
    setNewAssetCoin("");
    setNewAssetNetwork("");
  };

  const removeAsset = (index) =>
    setEditingAssets((prev) => prev.filter((_, i) => i !== index));



  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-[#1a012b] via-black to-[#001933] text-white">
      <div className="absolute top-32 left-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-24 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-16">
        <div className="mb-8">
          <AdminTopNav />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <Users className="h-8 w-8 text-primary" />,      label: "Total Users",  value: totalUsers },
            { icon: <TrendingUp className="h-8 w-8 text-primary" />, label: "Total Value",  value: `$${totalValue.toLocaleString()}` },
            { icon: <Wallet className="h-8 w-8 text-primary" />,     label: "Total Assets", value: totalAssets },
          ].map(({ icon, label, value }) => (
            <Card key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  {icon}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="text-2xl text-white font-bold">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:border-primary focus:ring-0"
          />
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:border-primary/40 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{user.name}</CardTitle>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>

                  <Dialog
                    open={selectedUser?.id === user.id}
                    onOpenChange={(open) => !open && setSelectedUser(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-white hover:bg-primary/20 rounded-lg transition"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="bg-linear-to-bl from-[#350661] via-black to-[#001F3F] border border-white/10 shadow-2xl max-w-4xl w-full rounded-xl overflow-hidden">
                      <div className="space-y-12 px-12 py-10 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">

                        {/* Current Assets */}
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold mb-6 text-white">Current Assets</h3>
                          {editingAssets.length === 0 ? (
                            <p className="text-gray-400 text-lg">No assets yet. Add one below.</p>
                          ) : (
                            <div className="space-y-6">
                              {editingAssets.map((asset, index) => (
                                <div
                                  key={`${asset.coin}-${asset.network}`}
                                  className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5 hover:border-primary/40 transition"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${ASSETS[asset.coin]?.color} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                      {asset.coin}
                                    </div>
                                    <div>
                                      <Label className="text-white text-base">{ASSETS[asset.coin]?.name}</Label>
                                      <p className="text-gray-400 text-sm">{asset.network}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label className="text-white text-sm mb-2 block">Network</Label>
                                      <Select value={asset.network} onValueChange={(v) => updateAssetNetwork(index, v)}>
                                        <SelectTrigger className="bg-black/40 border border-white/10 text-white">
                                          <SelectValue placeholder="Select Network" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black/90 border border-white/10 text-white">
                                          {COIN_NETWORKS[asset.coin]?.map((net) => (
                                            <SelectItem key={net} value={net}>{net}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-white text-sm">Amount</Label>
                                      <Input
                                        type="number"
                                        step="any"
                                        value={asset.amount}
                                        onChange={(e) => updateAssetAmount(index, e.target.value)}
                                        className="bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary outline-none"
                                      />
                                    </div>

                                    <div className="flex items-end">
                                      <Button
                                        type="button"
                                        onClick={() => removeAsset(index)}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Add New Asset */}
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold mb-5 text-white">Add New Asset</h3>
                          <div className="flex flex-col md:flex-row gap-4 items-center">
                            <Select
                              value={newAssetCoin}
                              onValueChange={(v) => { setNewAssetCoin(v); setNewAssetNetwork(""); }}
                            >
                              <SelectTrigger className="bg-black/40 border border-white/10 rounded-xl text-white min-w-40 w-full md:w-auto">
                                <SelectValue placeholder="Select Coin" />
                              </SelectTrigger>
                              <SelectContent className="bg-black/80 border border-white/10 text-white">
                                {Object.entries(ASSETS).map(([symbol, asset]) => (
                                  <SelectItem key={symbol} value={symbol}>
                                    {asset.name} ({symbol})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {newAssetCoin && (
                              <Select value={newAssetNetwork} onValueChange={setNewAssetNetwork}>
                                <SelectTrigger className="bg-black/40 border border-white/10 rounded-xl text-white min-w-40 w-full md:w-auto">
                                  <SelectValue placeholder="Select Network" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/80 border border-white/10 text-white">
                                  {COIN_NETWORKS[newAssetCoin]
                                    .filter((n) => !editingAssets.some((a) => a.coin === newAssetCoin && a.network === n))
                                    .map((n) => (
                                      <SelectItem key={n} value={n}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}

                            <Button
                              type="button"
                              onClick={addNewAsset}
                              disabled={!newAssetCoin || !newAssetNetwork}
                              className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                              + Add Asset
                            </Button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-6 pt-8">
                          <Button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="bg-white/10 hover:bg-white/20 px-8 py-3 text-sm rounded-md"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSaveAssets}
                            disabled={isPending}
                            className="bg-primary hover:bg-primary/80 px-8 py-3 text-sm rounded-md text-white disabled:opacity-50"
                          >
                            {isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>

                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Value</span>
                    <span className="text-lg font-bold text-primary">
                      ${calculateTotalValue(user.assets).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Assets ({user.assets?.length ?? 0})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.assets?.map((asset) => (
                        <Badge
                          key={`${asset.coin}-${asset.network}`}
                          variant="secondary"
                          className="bg-white/10 border border-white/10 text-white text-xs rounded-full px-3 py-1"
                        >
                          {asset.coin} ({asset.network}): {asset.amount?.toLocaleString()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}