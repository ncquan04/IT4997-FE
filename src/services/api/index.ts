import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const baseURL =
  (import.meta as any).env?.VITE_ENDPOINT ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:4000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach access token from localStorage (if present)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token && config && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore (e.g., SSR or no localStorage)
  }
  return config;
});

// Basic refresh-token handling (uses /auth/refresh-token endpoint and withCredentials)
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}
function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest: any = error.config;

    // Skip refresh logic for auth endpoints (login, register, refresh-token itself)
    const isAuthEndpoint =
      originalRequest?.url &&
      (originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/register") ||
        originalRequest.url.includes("/auth/refresh-token"));

    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshUrl = `${baseURL.replace(/\/$/, "")}/auth/refresh-token`;
        const r = await axios.post(refreshUrl, {}, { withCredentials: true });
        const newToken = r?.data?.accessToken;
        if (newToken) {
          try {
            localStorage.setItem("accessToken", newToken);
          } catch (_) {}
          api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
          onRefreshed(newToken);
        }
        return api(originalRequest);
      } catch (e) {
        // fallback: redirect to login only if not already there
        try {
          localStorage.removeItem("accessToken");
        } catch (_) {}
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Convenience helpers that mirror the previous apiService behavior (return response.data)
export const apiService = {
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    const res = await api.get<T>(url, config);
    return res.data;
  },
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const res = await api.post<T>(url, data, config);
    return res.data;
  },
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const res = await api.put<T>(url, data, config);
    return res.data;
  },
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const res = await api.patch<T>(url, data, config);
    return res.data;
  },
  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    const res = await api.delete<T>(url, config);
    return res.data;
  },
};

export const setAccessToken = (token: string | null) => {
  if (token) {
    try {
      localStorage.setItem("accessToken", token);
    } catch (_) {}
    api.defaults.headers.common["Authorization"] = "Bearer " + token;
  } else {
    try {
      localStorage.removeItem("accessToken");
    } catch (_) {}
    delete api.defaults.headers.common["Authorization"];
  }
};
