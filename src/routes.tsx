import AdminPage from "@/app/admin/page";
import CalculationRulesAdminPage from "@/app/admin/calculation-rules/page";
import AdminUsersPage from "@/app/admin/users/page";
import AdminStagesPage from "@/app/admin/stages/page";
import LeadStagesPage from "@/app/admin/lead-stages/page";
import LeadsPage from "@/app/leads/page";
import LeadDetailPage from "@/app/leads/[id]/page";
import TasksPage from "@/app/tasks/page";
import DealDetailPage from "@/app/deals/[id]/page";
import EditDealPage from "@/app/deals/[id]/edit/page";
import CreateDealPage from "@/app/deals/create/page";
import DealsPage from "@/app/deals/page";
import CompaniesPage from "@/app/companies/page";
import AddressesPage from "@/app/addresses/page";
import LoginPage from "@/app/login/page";
import HomePage from "@/app/page";
import NotFoundPage from "@/app/not-found";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navigate, Route, Routes } from "react-router-dom";

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
      <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/admin/lead-stages" element={<ProtectedRoute managerOrAdmin><LeadStagesPage /></ProtectedRoute>} />
      <Route path="/admin/funnels" element={<ProtectedRoute managerOrAdmin><Navigate to="/admin/lead-stages" replace /></ProtectedRoute>} />
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
        path="/customers"
        element={
          <ProtectedRoute>
            <CompaniesPage role="customer" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/providers"
        element={
          <ProtectedRoute>
            <CompaniesPage role="provider" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <AddressesPage />
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
          <ProtectedRoute managerOrAdmin>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stages"
        element={
          <ProtectedRoute managerOrAdmin>
            <AdminStagesPage />
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
          <ProtectedRoute managerOrAdmin>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to="/" replace />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
