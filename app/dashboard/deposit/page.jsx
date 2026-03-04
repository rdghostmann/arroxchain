// /dashboard/deposit/page.jsx
import NavHeader from "../components/NavHeader/NavHeader";
import DepositPage from "./DepositPage";

export default function page() {

    return (
        <div className="relative min-h-screen w-full">
            <NavHeader className="text-foreground" />

            <DepositPage />


        </div>

    )
}