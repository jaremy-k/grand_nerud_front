"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import useAuthContext from "@/contexts/auth-context";
import {
  BarChart3Icon,
  CalculatorIcon,
  FactoryIcon,
  Handshake,
  House,
  ClipboardListIcon,
  TargetIcon,
  MapPinIcon,
  ListChecksIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import * as React from "react";
import { NavUser } from "./footer";
import { Header } from "./header";

const data = {
  navMain: [
    {
      title: "Работа",
      url: "",
      items: [
        { title: "Лиды", url: "/leads", icon: TargetIcon },
        { title: "Задачи", url: "/tasks", icon: ClipboardListIcon },
        {
          title: "Сделки",
          url: "/deals",
          icon: Handshake,
        },
      ],
    },
    {
      title: "Компании и объекты",
      url: "",
      items: [
        {
          title: "Заказчики",
          url: "/customers",
          icon: ShoppingBagIcon,
        },
        {
          title: "Исполнители",
          url: "/providers",
          icon: FactoryIcon,
        },
        {
          title: "Адреса",
          url: "/addresses",
          icon: MapPinIcon,
        },
      ],
    },
  ],
  adminNav: [
    {
      title: "Конструктор формул",
      url: "/admin/calculation-rules",
      icon: CalculatorIcon,
    },
  ],
  managerNav: [
    {
      title: "Воронки",
      url: "/admin/funnels",
      icon: ListChecksIcon,
    },
    {
      title: "Статистика",
      url: "/admin",
      icon: BarChart3Icon,
    },
    {
      title: "Пользователи",
      url: "/admin/users",
      icon: UsersIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { user } = useAuthContext();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Header />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link to="/">
                <House />
                <span>Рабочий стол</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}>
                      <Link to={item.url}>
                        <item.icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {(user?.admin || user?.manager) && (
          <SidebarGroup>
            <SidebarGroupLabel>Администрирование</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {(user?.admin || user?.manager) &&
                  data.managerNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url || (item.url === "/admin/funnels" && ["/admin/stages", "/admin/lead-stages"].includes(pathname))}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                {user?.admin &&
                  data.adminNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
