import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Define types for our auth context
type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<void>;
  resetError: () => void;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  resetError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

const API_URL = "/api/auth";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            // Clear invalid storage
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
          }
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

const login = async (email: string, password: string) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const responseText = await response.text();
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      throw new Error("Invalid response from server");
    }
    
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    //TODO COOKIES
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    setUser(data.user);
    setIsAuthenticated(true);
  } catch (err: any) {
    setError(err.message || "Login failed. Please try again.");
    console.error("Login error:", err);
  } finally {
    setIsLoading(false);
  }
};

  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const mockUser = {
        id: "user-" + Date.now(),
        email: email,
        name: name || email.split("@")[0],
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store auth information
      localStorage.setItem("authToken", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      setUser(mockUser);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // TODO COOKIES
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const resetError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    resetError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
