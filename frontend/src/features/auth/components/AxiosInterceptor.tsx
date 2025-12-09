import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { apiPrivate } from "../../../config/axiosPrivate";
import { useNavigate } from "react-router";

export const AxiosInterceptor = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSet, setIsSet] = useState(false);
  const { user } = useAuth(); // Now you can access User state!
  const { logout } = useLogout(); // Now you can access your Logout hook!
  const navigate = useNavigate();

  useEffect(() => {
    const responseInterceptor = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized
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
            console.error("Session expired", refreshError);
            await logout();

            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    setIsSet(true);

    return () => {
      apiPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, user, navigate]);

  return isSet ? <>{children}</> : null;
};
