import {useEffect, useState} from "react";
import type {Course} from "../../../shared/types";
import axios from "axios";
import {getMyCurriculum} from "../services/myCurriculumService.ts";

export default function useMyCurriculum() {
    const [myCurriculum, setMyCurriculum] = useState<Course | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadMyCurriculum() {
            setLoading(true);
            try {
                const response = await getMyCurriculum();
                setMyCurriculum(response);
            } catch(err) {
                if(axios.isAxiosError(err)) {
                    setError(err.response?.data.error?.message || "Failed to fetch curriculum");
                } else {
                    setError("Failed to fetch curriculum");
                }
            } finally {
                setLoading(false);
            }
        }
        loadMyCurriculum();
    }, []);

    return { myCurriculum, loading, error };
}