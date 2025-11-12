"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useAuthContext from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { Spinner } from "../ui/spinner";
import { AppSidebar } from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuthContext();

  if (loading || (pathname === "/login" && user))
    return (
      <div className="w-svw h-svh items-center justify-center flex">
        <Spinner className="w-12 h-12" />
      </div>
    );

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pb-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
