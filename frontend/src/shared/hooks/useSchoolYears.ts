import {useState, useEffect} from "react";
import {schoolYearService} from "../services/schoolYearService";
import {type SchoolYear, SchoolYearStatus} from "../types";
import axios from "axios";

interface SchoolYearResponseError {
    error: {
        message: string;
    };
}

export const useSchoolYears = () => {
    const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchoolYears = async () => {
        setLoading(true);
        try {
            const data = await schoolYearService.getAll();
            setSchoolYears(data);
        } catch (err) {
            if (axios.isAxiosError<SchoolYearResponseError>(err)) {
                setError(err.response?.data.error.message || "Failed to fetch school years");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    const activeSchoolYear = schoolYears.find(
        (sy) => sy.status === SchoolYearStatus.Active
    );

    return {
        schoolYears,
        activeSchoolYear,
        loading,
        error,
        refetch: fetchSchoolYears,
    };
};
