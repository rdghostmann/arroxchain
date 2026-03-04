"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  Send,
  WalletCards,
  Briefcase,
  ShieldAlert,
  LineChart,
} from "lucide-react";

// 🔧 Define action buttons (route-based)
const actions = [
  { label: "Deposit", href: "/dashboard/deposit", icon: <Send size={20} /> },
  { label: "Withdrawal", href: "/dashboard/withdraw", icon: <ArrowDownToLine size={20} /> },
  { label: "Buy", href: "/dashboard/buy", icon: <WalletCards size={20} /> },
  { label: "Stocks", href: "/dashboard/stocks", icon: <LineChart size={20} /> },
  { label: "401k", href: "/dashboard/401k", icon: <Briefcase size={20} /> },
  { label: "FBI", href: "/dashboard/fbi", icon: <ShieldAlert size={20} /> },
];

const ActionButtons = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-12 relative">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-[120px] opacity-60 animate-pulse" />
      </div>

      <div className="relative rounded-3xl p-px bg-linear-to-r from-primary via-indigo-500 to-primary">
        <div className="rounded-3xl bg-card/80 backdrop-blur-2xl relative overflow-hidden shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/30">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-6 px-2 sm:px-4">
            {actions.map(({ label, href, icon }) => {
              const buttonClass =
                "w-[80px] h-[80px] bg-card hover:bg-card/80 border border-border text-foreground rounded-xl flex flex-col items-center justify-center gap-1 transition hover:shadow-lg shadow-primary/10";

              return (
                <Link
                  key={label}
                  href={href}
                  className={buttonClass}
                >
                  <div className="text-primary">{icon}</div>
                  <span className="text-xs">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;