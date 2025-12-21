import { useCallback, useEffect, useState } from "react";
import { getMyProfile } from "../services/studentService";
import type { StudentAggregate } from "../types";
import { toast } from "react-toastify";

export const useStudentProfile = () => {
  const [student, setStudent] = useState<StudentAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile();
      setStudent(data);
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      const msg =
        err.response?.data?.error?.message || "Failed to fetch profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { student, loading, error, refetch: fetchProfile };
};
