import WalletPage from "./WalletPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // Server-side fetch — must use absolute URL in App Router SSR
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/admin/wallet/users`, {
      cache: "no-store", // always fresh
      headers: {
        // Forward the session cookie so the API route can authenticate
        cookie: headersList.get("cookie") ?? "",
      },
    });

    const data = await res.json();
    const users = data.success ? data.users : [];
    return <WalletPage initialUsers={users} />;
  } catch (error) {
    console.error("❌ Page failed to fetch users:", error.message);
    return <WalletPage initialUsers={[]} />;
  }
}