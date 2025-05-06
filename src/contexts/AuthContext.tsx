
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the user roles
export type UserRole = 'purchasing' | 'chef' | 'receiver' | null;

// Define the user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);
