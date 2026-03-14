// app/(dashboard)/transactions/page.js  ← Server Component (no "use client")
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import TransactionPage from "./TransactionPage";
import { authOptions } from "@/auth";

export default async function TransactionsRoute() {
  const session = await getServerSession(authOptions);
  const Uuser = session.user.id;

  if (!session?.user?.id) {
    redirect("/login");
  }

  console.log(Uuser);
  

  return <TransactionPage userId={session.user.id} />;
}