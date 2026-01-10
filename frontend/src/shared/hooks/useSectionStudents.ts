import {useState, useEffect, useCallback} from "react";
import {getSectionStudents} from "../services/sectionService";
import axios from "axios";
import type {Student} from "../types";

interface SectionStudentsResponseError {
    error: {
        message: string;
    }
}

export const useSectionStudents = (sectionId?: string, semester?: number) => {
    const [students, setStudents] = useState<Student[] | []>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = useCallback(
        async (signal?: AbortSignal) => {
            if (!sectionId) return;

            setLoading(true);
            setError(null);

            try {
                const data = await getSectionStudents(sectionId, semester);

                setStudents(data);
            } catch (err) {
                if (axios.isAxiosError<SectionStudentsResponseError>(err))
                    if (err.name !== "CanceledError" && err.name !== "AbortError") {
                        setError(
                            err.response?.data?.error?.message || "Failed to fetch students"
                        );
                    }
            } finally {
                setLoading(false);
            }
        },
        [sectionId, semester]
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchStudents(controller.signal);
        return () => controller.abort();
    }, [fetchStudents]);

    return {
        students,
        loading,
        error,
        refetch: fetchStudents,
    };
};
