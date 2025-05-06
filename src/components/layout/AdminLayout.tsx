
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Settings, LogOut, ShieldCheck } from 'lucide-react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: "User Management", path: "/admin/users", icon: Users },
    { title: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-semibold">ProcureChef Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-gray-600">
                {user.name} (Admin)
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
        <aside className="hidden md:block w-56 bg-white border-r border-gray-200">
          <nav className="p-4">
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                <ShieldCheck className="h-5 w-5" />
                Admin Panel
              </div>
              <div className="text-xs text-gray-500">
                Manage users and system settings
              </div>
            </div>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 p-2 rounded ${
                      location.pathname === item.path
                        ? "bg-purple-100 text-purple-700"
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

export default AdminLayout;
