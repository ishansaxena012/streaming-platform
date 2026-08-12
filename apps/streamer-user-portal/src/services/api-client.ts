import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import { useAuthStore } from "../store/auth.store";

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Auto-attach Bearer Authorization Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error codes and handle token refreshes
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    // Unwrap the NestJS ResponseInterceptor envelope if present
    if (resData && typeof resData === "object" && "success" in resData && "data" in resData) {
      return resData.data;
    }
    return resData;
  },
  async (error: AxiosError) => {
    // Check if unauthorized
    if (error.response?.status === 401) {
      // Force logout since backend doesn't support refresh tokens yet
      useAuthStore.getState().logout();
    }
    
    // Standardize error formats for application consumers
    const normalizedError = {
      message: (error.response?.data as any)?.message || error.message || "An unexpected network error occurred",
      status: error.response?.status,
      code: (error.response?.data as any)?.code || error.code || "ERR_NETWORK",
    };
    
    return Promise.reject(normalizedError);
  }
);
