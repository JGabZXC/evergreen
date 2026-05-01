import {type ReactNode, useEffect, useState} from "react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { apiPrivate } from "../../../config/axiosPrivate";
import { useNavigate } from "react-router";

// 1. Define these OUTSIDE the component to act as a singleton lock
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void; }[] = [];

const processQueue = (error: unknown, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const AxiosInterceptor = ({ children }: {children: ReactNode}) => {
  const [isSet, setIsSet] = useState(false);
  const { user } = useAuth();
  const { logout } = useLogout();
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
              !originalRequest.url?.includes("/auth/refresh-token")
          ) {

            if (isRefreshing) {
              return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
              })
                  .then(() => {
                    return apiPrivate(originalRequest);
                  })
                  .catch((err) => {
                    return Promise.reject(err);
                  });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
              await apiPrivate.post("/api/auth/refresh-token");

              processQueue(null);
              isRefreshing = false;
              return apiPrivate(originalRequest);

            } catch (refreshError) {
              processQueue(refreshError, null);
              isRefreshing = false;

              console.error("Session expired", refreshError);
              await logout();
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSet(true);

    return () => {
      apiPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, user, navigate]);

  return isSet ? <>{children}</> : null;
};