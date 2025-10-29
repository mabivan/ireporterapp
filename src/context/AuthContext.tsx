// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userApi, SignupData, LoginData, User } from "../api/usersApi";

// ✅ Update LoginData interface to include rememberMe
interface ExtendedLoginData extends LoginData {
  rememberMe?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (userData: SignupData) => Promise<boolean>;
  login: (loginData: ExtendedLoginData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Storage keys constants
  const STORAGE_KEYS = {
    TOKEN: "authToken",
    USER: "userData",
    REMEMBER_ME: "rememberMe",
  };

  // ✅ Helper function to get storage based on rememberMe preference
  const getStorage = () => {
    const rememberMe =
      localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
    return rememberMe ? localStorage : sessionStorage;
  };

  // ✅ Helper function to clear all auth data
  const clearAllAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);

    // Clear backward compatibility items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ CRITICAL FIX: Validate token with backend on every app start
  const validateTokenWithBackend = async (
    token: string
  ): Promise<User | null> => {
    try {
      // Store the token temporarily for the API call
      const previousToken = localStorage.getItem("token");
      localStorage.setItem("token", token);

      // This will make an actual API call to verify the token
      const currentUser = await userApi.getCurrentUser();

      console.log("✅ Token validated successfully:", currentUser);
      return currentUser;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      // Clear the invalid token
      localStorage.removeItem("token");
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ Check both storage locations for existing auth data
        const storage = getStorage();
        const token = storage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = storage.getItem(STORAGE_KEYS.USER);

        console.log(
          "🔐 Auth init - Token:",
          !!token,
          "StoredUser:",
          !!storedUser,
          "RememberMe:",
          localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)
        );

        if (token) {
          // ✅ CRITICAL FIX: Validate token with backend every time
          console.log("🔄 Validating token with backend...");
          const validUser = await validateTokenWithBackend(token);

          if (validUser) {
            // Token is valid, set user
            setUser(validUser);

            // Ensure token is stored in both places for backward compatibility
            localStorage.setItem("token", token);
          } else {
            // Token is invalid, clear everything
            console.log("🚫 Token invalid, clearing auth data");
            clearAllAuthData();
            setUser(null);
          }
        } else {
          // No token found, clear any partial state
          console.log("🚫 No token found, clearing auth data");
          setUser(null);
          clearAllAuthData();
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        clearAllAuthData();
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
        console.log("✅ Auth initialization complete");
      }
    };

    initAuth();
  }, []);

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await userApi.signup(userData);

      if (result.success && result.data) {
        // ✅ Default to sessionStorage for new signups (more secure)
        const storage = sessionStorage;
        storage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, "false");

        // Keep for backward compatibility
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("token", result.data.token);

        setUser(result.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.response?.data?.message?.includes("already exists")) {
        throw new Error("An account with this email already exists");
      }
      throw new Error("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: ExtendedLoginData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await userApi.login(loginData);

      if (result.success && result.data) {
        const { rememberMe = false } = loginData;

        // ✅ Choose storage based on rememberMe preference
        const storage = rememberMe ? localStorage : sessionStorage;

        // Store in chosen storage
        storage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));

        // Store rememberMe preference in localStorage
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());

        // Keep for backward compatibility
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("token", result.data.token);

        setUser(result.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password");
      }
      throw new Error("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await userApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearAllAuthData();
      setLoading(false);
    }
  };

  // FIXED: Use consistent authentication check
  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading: loading || !authChecked,
    isAuthenticated,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
