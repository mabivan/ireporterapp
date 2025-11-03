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

  const STORAGE_KEYS = {
    TOKEN: "authToken",
    USER: "userData",
    SESSION_START: "sessionStartTime",
  };

  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  const clearAllAuthData = () => {
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);
  };

  const isSessionExpired = (): boolean => {
    const sessionStart = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (!sessionStart) return true;

    return Date.now() - parseInt(sessionStart, 10) > SESSION_DURATION;
  };

  // ✅ Initialize auth: no persistent localStorage check
  useEffect(() => {
    const initAuth = async () => {
      setUser(null); // Always start with no user
      setLoading(false);
    };
    initAuth();
  }, []);

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await userApi.signup(userData);

      if (result.success && result.data) {
        // Store in sessionStorage only
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        sessionStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.data.user)
        );
        sessionStorage.setItem(
          STORAGE_KEYS.SESSION_START,
          Date.now().toString()
        );

        setUser(result.data.user);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: ExtendedLoginData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await userApi.login(loginData);

      if (result.success && result.data) {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        sessionStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(result.data.user)
        );
        sessionStorage.setItem(
          STORAGE_KEYS.SESSION_START,
          Date.now().toString()
        );

        setUser(result.data.user);
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await userApi.logout();
    } finally {
      setUser(null);
      clearAllAuthData();
      setLoading(false);
    }
  };

  // Auto-logout on tab close (sessionStorage clears automatically)
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAllAuthData();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
