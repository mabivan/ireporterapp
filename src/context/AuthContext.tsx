// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userApi, SignupData, LoginData, User } from "../api/usersApi";

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

  // ✅ Storage keys - focus on sessionStorage for true session-based auth
  const STORAGE_KEYS = {
    TOKEN: "authToken",
    USER: "userData",
    REMEMBER_ME: "rememberMe",
    SESSION_START: "sessionStartTime",
  };

  // ✅ Session timeout (8 hours - adjust as needed)
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  // ✅ Helper to get appropriate storage
  const getStorage = () => {
    const rememberMe =
      localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
    return rememberMe ? localStorage : sessionStorage;
  };

  // ✅ Check if session has expired
  const isSessionExpired = (): boolean => {
    const sessionStart = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!sessionStart) return true;

    const sessionTime = parseInt(sessionStart, 10);
    const currentTime = Date.now();

    return currentTime - sessionTime > SESSION_DURATION;
  };

  // ✅ Clear all auth data
  const clearAllAuthData = () => {
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);

    // Clear localStorage auth data
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

    // Clear legacy items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  // ✅ Validate token with backend
  const validateTokenWithBackend = async (
    token: string
  ): Promise<User | null> => {
    try {
      // Store token temporarily for API call
      const previousToken = localStorage.getItem("token");
      localStorage.setItem("token", token);

      const currentUser = await userApi.getCurrentUser();
      console.log("✅ Token validated successfully");
      return currentUser;
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      return null;
    }
  };

  // ✅ Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storage = getStorage();
        const token = storage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = storage.getItem(STORAGE_KEYS.USER);

        console.log("🔐 Auth initialization started");

        if (token && storedUser) {
          // Check if session has expired (only for sessionStorage)
          if (storage === sessionStorage && isSessionExpired()) {
            console.log("🚫 Session expired");
            clearAllAuthData();
            setUser(null);
          } else {
            // Validate token with backend
            console.log("🔄 Validating token with backend...");
            const validUser = await validateTokenWithBackend(token);

            if (validUser) {
              setUser(validUser);
              console.log("✅ User authenticated from storage");
            } else {
              console.log("🚫 Invalid token, clearing auth data");
              clearAllAuthData();
              setUser(null);
            }
          }
        } else {
          // No valid auth data found
          console.log("🚫 No valid auth data found");
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

  // ✅ Signup function
  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await userApi.signup(userData);

      if (result.success && result.data) {
        // Use sessionStorage for new signups (true session-based)
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        sessionStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.data.user)
        );
        sessionStorage.setItem(
          STORAGE_KEYS.SESSION_START,
          Date.now().toString()
        );

        // Set rememberMe to false by default for session-based auth
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, "false");

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

  // ✅ Login function - now truly session-based
  const login = async (loginData: ExtendedLoginData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await userApi.login(loginData);

      if (result.success && result.data) {
        const { rememberMe = false } = loginData;

        // Always use sessionStorage for the main auth data
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        sessionStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.data.user)
        );
        sessionStorage.setItem(
          STORAGE_KEYS.SESSION_START,
          Date.now().toString()
        );

        // Store rememberMe preference separately
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());

        // If rememberMe is true, also store in localStorage as backup
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(result.data.user)
          );
        } else {
          // Clear any existing localStorage auth data
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }

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

  // ✅ Logout function
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

  // ✅ Auto-logout on browser close/tab close for session storage
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If using sessionStorage only (rememberMe false), clear on close
      const rememberMe =
        localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
      if (!rememberMe) {
        // Session storage will automatically clear, but we can do additional cleanup
        clearAllAuthData();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading: loading || !authChecked,
    isAuthenticated: !!user,
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
