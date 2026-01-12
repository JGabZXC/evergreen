import { useState, useCallback, useEffect } from "react";
import { getMyStudents } from "../services/studentService";
import type { StudentAggregate } from "../../dashboard-registrar/types";
import axios from "axios";

export const useMyStudents = (schoolYear: string) => {
  const [students, setStudents] = useState<StudentAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const fetchStudents = useCallback(async () => {

    if (!schoolYear || schoolYear === "all") return;

    try {
      setLoading(true);
      setError(null);
      const data = await getMyStudents(schoolYear, page, 100);
      console.log(data);
      setStudents(data.students);
      setTotalPages(data.totalPages);
      setTotalDocs(data.totalDocs);
    } catch (err) {
        if(axios.isAxiosError(err)) {
            setError(err.response?.data?.error?.message || "Failed to fetch students");
        } else {
            setError("An unexpected error occurred");
        }

    } finally {
      setLoading(false);
    }
  }, [schoolYear, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalDocs,
    refresh: fetchStudents,
  };
};

