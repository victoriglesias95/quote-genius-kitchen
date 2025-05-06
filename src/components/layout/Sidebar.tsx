
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  LayoutGrid,
  Database,
  LogOut,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Menu items for purchasing department
  const purchasingMenuItems = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    { title: "Suppliers", path: "/suppliers", icon: Users },
    { title: "Product Database", path: "/products/database", icon: Database },
    { title: "Ingredients", path: "/ingredients", icon: Package },
    { title: "Quote Requests", path: "/quotes", icon: FileText },
    { title: "Product Comparison", path: "/products/compare", icon: LayoutGrid },
    { title: "Purchasing Assistant", path: "/quotes/purchasing-assistant", icon: ShoppingBag },
    { title: "Reports", path: "/reports", icon: BarChart3 },
    { title: "Settings", path: "/settings", icon: Settings },
  ];
  
  // Menu items for admin
  const adminMenuItems = [
    { title: "User Management", path: "/admin/users", icon: Users },
    { title: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  // Determine if admin navigation should be shown
  const showAdminNav = user?.role === 'admin';

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-orange" />
          <h1 className="text-lg font-display font-semibold text-white">ProcureChef</h1>
        </div>
        {user && (
          <div className="mt-2 text-sm text-sidebar-foreground opacity-70">
            Logged in as {user.name} ({user.role})
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground opacity-70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {purchasingMenuItems.map((item) => (
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
        
        {/* Admin Navigation */}
        {showAdminNav && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground opacity-70 flex items-center gap-1">
              <Shield className="h-4 w-4 text-purple-400" />
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
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
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col space-y-2">
          <Button variant="outline" onClick={logout} className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <div className="text-xs text-sidebar-foreground opacity-50">
            ProcureChef v1.0.0
          </div>
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
