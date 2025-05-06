
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ClipboardCheck, Clock, LogOut } from 'lucide-react';

const ChefLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: "Inventory", path: "/chef/inventory", icon: Package },
    { title: "Requests", path: "/chef/requests", icon: ClipboardCheck },
    { title: "Order Status", path: "/chef/orders", icon: Clock },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-500"><rect width="20" height="14" x="2" y="3" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>
            <h1 className="text-xl font-semibold">ProcureChef</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-gray-600">
                {user.name} (Chef)
              </span>
            )}
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
        <nav className="flex justify-around items-center">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-3 ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-gray-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="flex flex-1">
        <aside className="hidden md:block w-48 bg-white border-r border-gray-200">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 p-2 rounded ${
                      location.pathname === item.path
                        ? "bg-gray-100 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-24 md:pb-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ChefLayout;
