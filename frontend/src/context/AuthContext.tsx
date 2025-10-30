import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../utils/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("ireporter_user");
    const token = localStorage.getItem("ireporter_token");

    if (savedUser && token) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData.error);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("ireporter_user", JSON.stringify(data.user));
      localStorage.setItem("ireporter_token", data.token);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (
    userData: Omit<User, "id" | "registered" | "isAdmin" | "isActive">
  ): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Signup failed:", errorData.error);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("ireporter_user", JSON.stringify(data.user));
      localStorage.setItem("ireporter_token", data.token);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ireporter_user");
    localStorage.removeItem("ireporter_token");
  };

  // ✅ New method to update user info
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("ireporter_user", JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    //updateUser, // TypeScript now recognizes this
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
