import type {Section} from "../../../shared/types";
import {useEffect, useState} from "react";
import {getMySections} from "../services/mySectionsService.ts";
import axios from "axios";

export function useMySections(schoolYear: string = "all") {
    const [mySections, setMySections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function loadMySections() {
            setLoading(true);
            setError("");
            try {
                const sections = await getMySections(schoolYear);
                setMySections(sections);
            } catch (err) {
                if (axios.isAxiosError(err))
                    setError(
                        err.response?.data?.error?.message || "Failed to fetch my sections"
                    );
            } finally {
                setLoading(false);
            }
        }

        loadMySections();
    }, [schoolYear]);

    return {
        mySections,
        loading,
        error,
    }
}