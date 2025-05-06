
import React, { createContext, useContext, useState, useEffect } from 'react';

// Export the UserRole type
export type UserRole = 'chef' | 'purchasing' | 'receiver' | 'admin';

// Define the user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Helper function to get role permissions
export const getRolePermissions = (role: UserRole) => {
  switch (role) {
    case 'chef':
      return {
        canCreateRequest: true,
        canApproveRequest: false,
        canSubmitQuote: false,
        canPlaceOrder: false,
        canReceiveOrder: true,
        canViewAnalytics: true,
      };
    case 'purchasing':
      return {
        canCreateRequest: false,
        canApproveRequest: true,
        canSubmitQuote: false,
        canPlaceOrder: true,
        canReceiveOrder: false,
        canViewAnalytics: true,
      };
    case 'receiver':
      return {
        canCreateRequest: false,
        canApproveRequest: false,
        canSubmitQuote: false,
        canPlaceOrder: false,
        canReceiveOrder: true,
        canViewAnalytics: false,
      };
    case 'admin':
      return {
        canCreateRequest: true,
        canApproveRequest: true,
        canSubmitQuote: true,
        canPlaceOrder: true,
        canReceiveOrder: true,
        canViewAnalytics: true,
        canManageUsers: true,
      };
    default:
      return {
        canCreateRequest: false,
        canApproveRequest: false,
        canSubmitQuote: false,
        canPlaceOrder: false,
        canReceiveOrder: false,
        canViewAnalytics: false,
      };
  }
};

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  hasPermission: (permission: keyof ReturnType<typeof getRolePermissions>) => boolean;
  getAllUsers: () => User[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
  deleteUser: (userId: string) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  hasPermission: () => false,
  getAllUsers: () => [],
  updateUserRole: () => {},
  deleteUser: () => {},
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, you would use localStorage or a more secure storage method
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user is stored in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('procureChef_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isAuthenticated = !!user;

  // Permission checker based on user role
  const hasPermission = (permission: keyof ReturnType<typeof getRolePermissions>) => {
    if (!user || !user.role) return false;
    const permissions = getRolePermissions(user.role);
    return permissions[permission] || false;
  };

  // Get all registered users
  const getAllUsers = () => {
    const usersString = localStorage.getItem('procureChef_users');
    if (!usersString) return [];
    return JSON.parse(usersString) as User[];
  };

  // Update user role
  const updateUserRole = (userId: string, newRole: UserRole) => {
    const usersString = localStorage.getItem('procureChef_users');
    if (!usersString) return;
    
    const users = JSON.parse(usersString) as User[];
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    
    localStorage.setItem('procureChef_users', JSON.stringify(updatedUsers));
    
    // If the updated user is the current user, update the current user state
    if (user && user.id === userId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('procureChef_user', JSON.stringify(updatedUser));
    }
  };

  // Delete a user
  const deleteUser = (userId: string) => {
    const usersString = localStorage.getItem('procureChef_users');
    if (!usersString) return;
    
    const users = JSON.parse(usersString) as User[];
    const filteredUsers = users.filter(u => u.id !== userId);
    
    localStorage.setItem('procureChef_users', JSON.stringify(filteredUsers));
    
    // If the deleted user is the current user, log them out
    if (user && user.id === userId) {
      logout();
    }
  };

  // Mock login function - in a real app, you'd call an API
  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, we would check the credentials against a database
    // For now, we'll just retrieve the user from localStorage
    const usersString = localStorage.getItem('procureChef_users');
    if (!usersString) {
      throw new Error("No users found. Please register first.");
    }
    
    const users = JSON.parse(usersString) as User[];
    const foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      throw new Error("User not found.");
    }
    
    // In a real app, we would check the password here
    // For demo purposes, we'll just use the found user
    setUser(foundUser);
    localStorage.setItem('procureChef_user', JSON.stringify(foundUser));
  };

  // Register a new user
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role
    };
    
    // Store user in mock "database" (localStorage)
    const usersString = localStorage.getItem('procureChef_users');
    const users = usersString ? JSON.parse(usersString) as User[] : [];
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      throw new Error("User already exists.");
    }
    
    users.push(newUser);
    localStorage.setItem('procureChef_users', JSON.stringify(users));
    
    // Automatically log in the user
    setUser(newUser);
    localStorage.setItem('procureChef_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('procureChef_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      hasPermission,
      getAllUsers,
      updateUserRole,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);
