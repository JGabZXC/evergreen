import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useLogout } from "./useLogout";
import { apiPrivate } from "../../../config/axiosPrivate";

const useAxiosPrivate = () => {
  const { user } = useAuth();
  const { logout } = useLogout();

  useEffect(() => {
    const responseIntercept = apiPrivate.interceptors.response.use(
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
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [logout, user]);

  return apiPrivate;
};

export { useAxiosPrivate };
