import NavHeader from "../components/NavHeader/NavHeader";
import ConnectWallet from "./ConnectWallet";

export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 relative z-10">
        <NavHeader />
        <ConnectWallet />
      </div>
    </div>
  );
}

