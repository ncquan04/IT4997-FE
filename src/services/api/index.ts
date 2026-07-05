import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const baseURL =
  (import.meta as any).env?.VITE_ENDPOINT ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:4000";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error?.config?.url || "";
    const isAuthEndpoint = /\/auth\/(login|register)/.test(url);
    if (
      error?.response?.status === 401 &&
      !isAuthEndpoint &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

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
