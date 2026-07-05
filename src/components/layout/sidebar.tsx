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
  Handshake,
  House,
  UsersIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import * as React from "react";
import { NavUser } from "./footer";
import { Header } from "./header";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Основное",
      url: "",
      items: [
        {
          title: "Сделки",
          url: "/deals",
          icon: Handshake,
        },
      ],
    },
  ],
  adminNav: [
    {
      title: "Статистика",
      url: "/admin",
      icon: BarChart3Icon,
    },
    {
      title: "Конструктор формул",
      url: "/admin/calculation-rules",
      icon: CalculatorIcon,
    },
  ],
  managerNav: [
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
                <span>Главная</span>
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
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
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
                {(user?.admin || user?.manager) &&
                  data.managerNav.map((item) => (
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
