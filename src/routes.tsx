import AdminPage from "@/app/admin/page";
import CalculationRulesAdminPage from "@/app/admin/calculation-rules/page";
import AdminUsersPage from "@/app/admin/users/page";
import DealDetailPage from "@/app/deals/[id]/page";
import EditDealPage from "@/app/deals/[id]/edit/page";
import CreateDealPage from "@/app/deals/create/page";
import DealsPage from "@/app/deals/page";
import DashboardPage from "@/app/dashboard/page";
import LoginPage from "@/app/login/page";
import HomePage from "@/app/page";
import NotFoundPage from "@/app/not-found";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/deals"
        element={
          <ProtectedRoute>
            <DealsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deals/create"
        element={
          <ProtectedRoute>
            <CreateDealPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deals/:id"
        element={
          <ProtectedRoute>
            <DealDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deals/:id/edit"
        element={
          <ProtectedRoute>
            <EditDealPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/calculation-rules"
        element={
          <ProtectedRoute adminOnly>
            <CalculationRulesAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
