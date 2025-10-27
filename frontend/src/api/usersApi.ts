// src/api/usersApi.ts
import { User } from "../utils/types";

// ===== USING YOUR EXISTING TYPES =====

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstname: string;
  lastname: string;
  othernames: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// ===== STORAGE UTILS =====
const storage = {
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// ===== API CONFIG =====
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  TIMEOUT: 10000, // 10 seconds
};

const API_URL = API_CONFIG.BASE_URL;

// ===== TOKEN MANAGEMENT =====
const TOKEN_KEY = "auth_token";
const USER_KEY = "current_user";

const setToken = (token: string) => storage.set(TOKEN_KEY, token);
const getToken = (): string | null => storage.get(TOKEN_KEY);
const removeToken = () => storage.remove(TOKEN_KEY);

const setUser = (user: User) => storage.set(USER_KEY, JSON.stringify(user));
const getUser = (): User | null => {
  const userStr = storage.get(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};
const removeUser = () => storage.remove(USER_KEY);

// ===== API UTILS =====
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout - please try again");
    }
    throw error;
  }
};

const handleApiResponse = async (response: Response): Promise<any> => {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || `HTTP error! status: ${response.status}`,
      status: response.status,
      code: data.code,
    };
    throw error;
  }

  return data;
};

// ===== AUTH API FUNCTIONS =====

// ---------------- Signup ----------------
export const signup = async (userData: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/signup`, {
      method: "POST",
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse(response);

    // Save token and user data
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Signup failed - please try again");
  }
};

// ---------------- Login ----------------
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = await handleApiResponse(response);

    // Save token and user data
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
    } else {
      throw new Error("Invalid response from server");
    }

    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Login failed - please try again");
  }
};

// ---------------- Logout ----------------
export const logout = (): void => {
  removeToken();
  removeUser();
};

// ---------------- Get Current User ----------------
export const getCurrentUser = async (
  forceRefresh: boolean = false
): Promise<User | null> => {
  const token = getToken();
  if (!token) {
    removeUser(); // Clear stale user data
    return null;
  }

  // Return cached user if not forcing refresh
  if (!forceRefresh) {
    const cachedUser = getUser();
    if (cachedUser) {
      return cachedUser;
    }
  }

  try {
    const response = await fetchWithTimeout(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      // Token might be invalid, clear local storage
      if (response.status === 401) {
        logout();
      }
      return null;
    }

    const data = await response.json();
    if (data.user) {
      setUser(data.user);
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return getUser(); // Fallback to cached user
  }
};

// ---------------- Update User Profile ----------------
export const updateProfile = async (
  userData: Partial<Omit<User, "id" | "registered" | "isAdmin" | "password">>
): Promise<User> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse(response);

    // Update cached user data
    if (data.user) {
      setUser(data.user);
    }

    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Profile update failed");
  }
};

// ---------------- Change Password ----------------
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(
      `${API_URL}/users/change-password`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    await handleApiResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Password change failed");
  }
};

// ---------------- Check Authentication Status ----------------
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// ---------------- Get Stored User (Synchronous) ----------------
export const getStoredUser = (): User | null => {
  return getUser();
};

// ---------------- Verify Token ----------------
export const verifyToken = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetchWithTimeout(`${API_URL}/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

// ===== USER MANAGEMENT API FUNCTIONS =====

// ---------------- Get All Users (Admin Only) ----------------
export const getAllUsers = async (): Promise<User[]> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await handleApiResponse(response);
    return data.users;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch users");
  }
};

// ---------------- Get User by ID ----------------
export const getUserById = async (userId: number): Promise<User> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await handleApiResponse(response);
    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch user");
  }
};

// ---------------- Update User Role (Admin Only) ----------------
export const updateUserRole = async (
  userId: number,
  isAdmin: boolean
): Promise<User> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(
      `${API_URL}/admin/users/${userId}/role`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAdmin }),
      }
    );

    const data = await handleApiResponse(response);
    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update user role");
  }
};

// ---------------- Deactivate User (Admin Only) ----------------
export const deactivateUser = async (userId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(
      `${API_URL}/admin/users/${userId}/deactivate`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await handleApiResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to deactivate user");
  }
};

// ---------------- Activate User (Admin Only) ----------------
export const activateUser = async (userId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(
      `${API_URL}/admin/users/${userId}/activate`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await handleApiResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to activate user");
  }
};

// ---------------- Get User Stats (Admin Only) ----------------
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  adminUsers: number;
  usersWithReports: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(`${API_URL}/admin/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await handleApiResponse(response);
    return data.stats;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch user stats");
  }
};

// ---------------- Search Users (Admin Only) ----------------
export const searchUsers = async (query: string): Promise<User[]> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetchWithTimeout(
      `${API_URL}/admin/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await handleApiResponse(response);
    return data.users;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to search users");
  }
};

export default {
  // Auth functions
  signup,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  isAuthenticated,
  getStoredUser,
  verifyToken,

  // User management functions
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserStats,
  searchUsers,
};
