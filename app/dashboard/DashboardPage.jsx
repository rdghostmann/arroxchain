import ActionButtons from "./components/ActionButtons/ActionButtons";
import CoinGeckoWidget from "./components/CoinGeckoWidget/CoinGeckoWidget";
import NavHeader from "./components/NavHeader/NavHeader";
import CardCarousel from "./components/CardCarousel/CardCarousel";
import AssetSection from "./components/AssestSection/AssetsSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import User from "@/models/User";
import { connectToDB } from "@/lib/connectDB";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  await connectToDB();
  const user = userEmail ? await User.findOne({ email: userEmail }).lean() : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Premium Glow Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 relative z-10">
        {/* Navigation */}
        <NavHeader />

        {/* Welcome */}
        <div className="">
          <h1 className="hidden text-4xl font-bold tracking-tight mb-6 leading-tight text-foreground">
            Welcome back{user ? `, ${user.username || ""}` : ""} 👋
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">
            Manage your crypto, stocks, and investments in one sleek dashboard.
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Left Content */}
          <div className="order-1 lg:col-span-2 space-y-20">
            {/* Carousel */}
            <div className="">
              <CardCarousel userIdOrEmail={userEmail} />
            </div>

            {/* Quick Actions */}
            <div className="">
              <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
              <ActionButtons userId={user?._id?.toString() || ""} />
            </div>

            {/* Assets */}
            <div className=" ">
              <h2 className="text-xl font-bold mb-4">💰 Your Assets</h2>
              <AssetSection />
            </div>
          </div>

          {/* Market Overview */}
          <div className="order-2 lg:sticky lg:top-12 h-fit">
            <div className="glass-card">
              <h2 className="text-xl font-bold mb-4">📈 Market Overview</h2>
              <CoinGeckoWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
