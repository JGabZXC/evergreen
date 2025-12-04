import axios from "axios";

export const apiPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await apiPrivate.post("/api/auth/refresh");

        return apiPrivate(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        await apiPrivate.post("/api/auth/logout");
        localStorage.removeItem("isAuth");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
