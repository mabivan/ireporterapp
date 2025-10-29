// src/api/userapi.ts
import axios from "axios";

// User interface
export interface User {
  id: string;
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  othernames?: string;
  username: string;
  role: "user" | "admin";
  isAdmin?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupData {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  password: string;
  othernames: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  error?: string;
}

class UserApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  }

  // Signup: real API call
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/signup`,
        userData
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
        error: error.message,
      };
    }
  }

  // Login: real API call
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/login`,
        loginData
      );

      // Store token and user in localStorage
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        error: error.message,
      };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; message: string }> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true, message: "Logged out successfully" };
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const userStr = localStorage.getItem("user");
    if (!userStr) throw new Error("No user found");
    return JSON.parse(userStr);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Get stored user
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Check authentication
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Refresh token (if backend supports it)
  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh-token`);
      localStorage.setItem("token", response.data.token);
      return { token: response.data.token };
    } catch {
      throw new Error("Failed to refresh token");
    }
  }
}

export const userApi = new UserApiService();
export default userApi;
