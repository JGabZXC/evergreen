import { useState, useEffect, useRef } from "react";
import { defaultApi } from "../../../config/axiosDefault";
import { toast } from "react-toastify";
import { parseError } from "../../../utils/parseErrors";
import { useAuth } from "./useAuth";
import type { AuthResponse } from "../types/auth.types";

export function useLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const { setUser } = useAuth();

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (abortControllerRef.current) abortControllerRef.current.abort();

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setErrors({});

    try {
      const result = await defaultApi.post<AuthResponse>(
        "/api/auth/login",
        formData,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      if (result.status === 200) {
        const user =
          result.data.user.role === "student"
            ? { ...result.data.user, studentId: result.data.studentId }
            : { ...result.data.user, employeeId: result.data.employeeId };
        setUser(user);
        localStorage.setItem("isAuth", "true");
        toast.success("Login successful!");
      }
    } catch (err: any) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;

      const parsedErrors = parseError(err);

      if (parsedErrors.global) {
        toast.error(parsedErrors.global);
      } else {
        setErrors(parsedErrors);
      }
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { formData, handleChange, submitLogin, loading, errors };
}
