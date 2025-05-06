import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  Mail,
  LayoutGrid
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  
  const menuItems = [
    { title: "Dashboard", path: "/", icon: Home },
    { title: "Suppliers", path: "/suppliers", icon: Users },
    { title: "Ingredients", path: "/ingredients", icon: Package },
    { title: "Quote Requests", path: "/quotes", icon: FileText },
    { title: "Product Comparison", path: "/products/compare", icon: LayoutGrid },
    { title: "Reports", path: "/reports", icon: BarChart3 },
    { title: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-orange" />
          <h1 className="text-lg font-display font-semibold text-white">ProcureChef</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground opacity-70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className={location.pathname === item.path ? "active" : ""}>
                    <Link to={item.path} className="nav-link">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground opacity-50">
          ProcureChef v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SidebarToggle() {
  return (
    <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md">
      <Menu className="h-5 w-5 text-navy" />
    </SidebarTrigger>
  );
}

// Need to define the Menu icon since it's not in the allowed list
function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
