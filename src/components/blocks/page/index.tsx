import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Link } from "react-router-dom";
import { Fragment } from "react";

export default function Page({
  children,
  breadcrumbLinks = [],
  headerActions,
}: {
  children: React.ReactNode;
  breadcrumbLinks?: Array<{ href: string; label: string }>;
  headerActions?: React.ReactNode;
}) {
  return (
    <>
      <header className="flex shrink-0 items-center gap-2 border-b px-4 pb-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbLinks &&
              breadcrumbLinks.length > 0 &&
              breadcrumbLinks.map((link, index) =>
                index < breadcrumbLinks.length - 1 ? (
                  <Fragment key={link.href}>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to={link.href}>{link.label}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </Fragment>
                ) : (
                  <BreadcrumbItem key={link.href}>
                    <BreadcrumbPage>{link.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )
              )}
          </BreadcrumbList>
        </Breadcrumb>
        {headerActions && (
          <>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            {headerActions}
          </>
        )}
      </header>
      <div className="min-w-0 flex-1 px-4">{children}</div>
    </>
  );
}
