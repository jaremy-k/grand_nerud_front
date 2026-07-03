import AdminPage from "@/app/admin/page";
import DealDetailPage from "@/app/deals/[id]/page";
import EditDealPage from "@/app/deals/[id]/edit/page";
import CreateDealPage from "@/app/deals/create/page";
import DealsPage from "@/app/deals/page";
import DashboardPage from "@/app/dashboard/page";
import LoginPage from "@/app/login/page";
import HomePage from "@/app/page";
import NotFoundPage from "@/app/not-found";
import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/deals" element={<DealsPage />} />
      <Route path="/deals/create" element={<CreateDealPage />} />
      <Route path="/deals/:id" element={<DealDetailPage />} />
      <Route path="/deals/:id/edit" element={<EditDealPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
