import { Spinner } from "@/components/ui/spinner";
import useAuthContext from "@/contexts/auth-context";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-svh w-svw items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.admin) {
    return <Navigate to="/deals" replace />;
  }

  return children;
}
