// app/admin/wallet/page.jsx
import WalletPage from "./WalletPage";
import { getWalletUsers } from "./actions";

export default async function Page() {
  const users = await getWalletUsers();
  return <WalletPage initialUsers={users} />;
}